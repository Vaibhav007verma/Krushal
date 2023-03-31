const RNFS = require('react-native-fs')

const { createHeaders } = require('@krushal-it/common-core')

const {
  getDBConnections,
  preProcessRecords,
  postProcessRecords
} = require('@krushal-it/ah-orm')

const {INITIALIZATION_SCREEN_STATES} = require('./constants')

const { uploadFileToS3, generateDestinationFileName, createFoldersIfNeeded } = require('./files')
import {
  setAuthenticationCheckState,
  setDBInitialization,
  setInitializationState,
  setInitialMasterDataSyncTimeSentState,
  setLoggedInUserDeviceId,
  setInitialDBBackupState
} from '../redux/actions/appStateOnPhone'

const { getServerReferenceTimeForSync, sendClientDeltaForSync, getServerDeltaForSync, updateLastSyncTimeForTables, getFileByKey } = require('../router/router')

const insertRecordsForEntity = async (dbConnections, databaseName, entity, recordsToBeInserted) => {
  const insertTableResults = await dbConnections[
    databaseName
  ].manager
    .createQueryBuilder()
    .insert()
    .into(entity)
    .values(recordsToBeInserted)
    .execute()

}

const getSyncReferenceTimeFromServer = async (userDeviceId) => {
  const headers = createHeaders(userDeviceId, 'Get Sync Reference Time')
  const referenceTimeResult = await getServerReferenceTimeForSync(headers)
  if (referenceTimeResult.return_code !== 0) {
    throw new Error('could not get sync reference time')
  }
  const referenceTimeFromServer = referenceTimeResult.data.now
  return referenceTimeFromServer
}

const uploadNotSyncedFiles = async (setTableName) => {
  // select records from document which has document_sync_status as 1000102002
  // if only 1 file exists, upload that one through regular api to upload
  // populate the s3Key received from server into document_information
  // save it (automatically, sync status is not synced)
  console.log('s uNSF 1')
  const dbConnections = getDBConnections()
  const documentRepo = dbConnections['main'].repos['document']
  const documentEntity = dbConnections['main'].entities['document']
  const filesNotSyncedDocumentsResult = await documentRepo
    .createQueryBuilder('client_table')
    .select(["document_id", "client_document_information", "document_information"])
    .where({document_sync_status: 1000102002})
    .getRawMany()
  console.log('s uNSF 2, filesNotSyncedDocumentsResult = ', filesNotSyncedDocumentsResult)
  postProcessRecords(undefined, filesNotSyncedDocumentsResult, {json_columns: ['client_document_information', "document_information"]})
  console.log('s uNSF 3, filesNotSyncedDocumentsResult 2 = ', filesNotSyncedDocumentsResult)
  for (const filesNotSyncedDocument of filesNotSyncedDocumentsResult) {
    console.log('s uNSF 4, filesNotSyncedDocument = ', filesNotSyncedDocument)
    const documentId = filesNotSyncedDocument.document_id
    if (filesNotSyncedDocument.document_information && filesNotSyncedDocument.document_information.fileName) {
      // since document_sync_status has been updated, we may have to re-upload a bunch of files. Need to dig deeper
      console.log('s uNSF 5')
    }
    let newDocumentInformation = {}
    if (filesNotSyncedDocument.document_information) {
      console.log('s uNSF 6')
      newDocumentInformation = {...filesNotSyncedDocument.document_information}
      const serverFiles = []
      for (const localFile of filesNotSyncedDocument.client_document_information.localFiles) {
        setTableName('Uploading ', localFile.fileName)
        console.log('s uNSF 7, localFile = ', localFile)
        const serverFile = {...localFile}
        // upload file
        const localFilePathWithoutLeadingProtocol = RNFS.DocumentDirectoryPath + '/' +
          filesNotSyncedDocument.client_document_information.localFolderName + '/' +
          filesNotSyncedDocument.client_document_information.fileName
        const fileUploadResult = await uploadFileToS3(filesNotSyncedDocument.client_document_information.fileName, localFilePathWithoutLeadingProtocol, filesNotSyncedDocument.client_document_information.fileType)
        console.log('s uNSF 8, fileUploadResult = ', fileUploadResult)
        serverFile.fileKey = fileUploadResult
        serverFiles.push(serverFile)
      }
      if (serverFiles.length > 0) {
        newDocumentInformation['serverFiles'] = serverFiles
        newDocumentInformation['fileName'] = serverFiles[0].fileName
        newDocumentInformation['fileKey'] = serverFiles[0].fileKey
      }
    }

    // set document entry -> update document_information, document_sync_status
    // done
    console.log('s uNSF 9, newDocumentInformation before preProcess = ', newDocumentInformation)
    const stringifiedNewDocumentInformation = JSON.stringify(newDocumentInformation)
    console.log('s uNSF 10, stringifiedNewDocumentInformation = ', stringifiedNewDocumentInformation)
    const documentUpdateResult = await documentRepo
      .createQueryBuilder()
      .update()
      .set({document_sync_status: 1000102001, data_sync_status: 1000101003, document_information: stringifiedNewDocumentInformation})
      // .set({document_information: stringifiedNewDocumentInformation})
      .where({ document_id: documentId })
      .execute()
    console.log('s uNSF 11, documentUpdateResult = ', documentUpdateResult)
  }
}


const collateClientDeltaAcrossTables = async (setSubStep, setTableName, clientTablesToSync) => {
  const dbConnections = getDBConnections()
  const clientDelta = []
  for (const databaseName in dbConnections) {
    const dbSpecificClientDelta = []
    console.log('s cCDAT 1, database name = ', databaseName)
    console.log('s cCDAT 2, database sync configuration = ', dbConnections[databaseName].syncConfiguration)

    let universalSetOfTablesToSyncForDB = []
    let relevantClientTablesInParams = []
    
    const dbSyncConfiguration = dbConnections[databaseName].syncConfiguration
    if (dbSyncConfiguration && dbSyncConfiguration.two_way_sync_tables && Array.isArray(dbSyncConfiguration.two_way_sync_tables)) {
      universalSetOfTablesToSyncForDB = dbSyncConfiguration.two_way_sync_tables
    }
    if (universalSetOfTablesToSyncForDB.length === 0) {
      throw new Error('Not sure of what tables to sync')
    }
    if (clientTablesToSync && clientTablesToSync[databaseName] && Array.isArray(clientTablesToSync[databaseName]) && clientTablesToSync[databaseName].length > 0) {
      relevantClientTablesInParams = clientTablesToSync[databaseName]
      relevantClientTablesInParams = relevantClientTablesInParams.filter((elem, index) => relevantClientTablesInParams.indexOf(elem) === index)
      relevantClientTablesInParams = relevantClientTablesInParams.filter(object => universalSetOfTablesToSyncForDB.includes(object))
    }
    const relevantClientTablesInDBForSync = (relevantClientTablesInParams.length > 0) ? relevantClientTablesInParams : universalSetOfTablesToSyncForDB
    relevantClientTablesInDBForSync.sort((a, b) => {
      return universalSetOfTablesToSyncForDB.indexOf(a) - universalSetOfTablesToSyncForDB.indexOf(b)
    })
    console.log('s cCDAT 1, relevantClientTablesInDBForSync = ', relevantClientTablesInDBForSync)

    // console.log('database contents = ', dbConnections[databaseName])
    // const twoWayTables = dbConnections[databaseName].syncConfiguration.two_way_sync_tables
    setSubStep("Collating Client Delta - " + databaseName + " DB")
    for (const twoWayTable of relevantClientTablesInDBForSync) {
      setTableName(twoWayTable)
      const primaryKey = dbConnections[databaseName].entities[twoWayTable].primaryColumns[0].propertyName
      const notSyncedRecordsQueryForTable = "select * from " + twoWayTable + " where data_sync_status in (1000101002, 1000101003)"
      const notSyncedRecordsForTable = await dbConnections[databaseName].manager.query(notSyncedRecordsQueryForTable)
      const notSyncedPrimaryKeyIdArray = notSyncedRecordsForTable.map((dbValuesInRow) => dbValuesInRow[primaryKey])
      let processed1NotSyncedRecordsForTable
      if (databaseName === 'main' && twoWayTable === 'document') {
        processed1NotSyncedRecordsForTable = notSyncedRecordsForTable.map(({created_at, updated_at, client_document_information, document_sync_status, data_sync_status, ...rest}) => rest)
      } else {
        processed1NotSyncedRecordsForTable = notSyncedRecordsForTable.map(({created_at, updated_at, data_sync_status, ...rest}) => rest)
      }
      if (processed1NotSyncedRecordsForTable.length > 0) {
        dbSpecificClientDelta.push({table_name: twoWayTable, table_delta: processed1NotSyncedRecordsForTable})
        // update records to marked for sending
        console.log('updating to status 1000101002')
        const tableUpdateToMarkSyncSentResult = await dbConnections[databaseName].repos[twoWayTable]
          .createQueryBuilder()
          .update()
          .set({data_sync_status: 1000101002})
          .where(primaryKey + " in (:...primaryKeyIds)", { primaryKeyIds: notSyncedPrimaryKeyIdArray })
          .execute()
        console.log('updated to status 1000101002')
      }
    }
    setTableName('')
    if (dbSpecificClientDelta.length > 0) {
      clientDelta.push({database_name: databaseName, database_delta: dbSpecificClientDelta})
    }
    setSubStep("Collating Client Delta")
    return clientDelta
  }
}

const updateRecordsBasedOnResponseOfSendingClientDelta = async (clientDeltaDatabaseDataArrayResponse, setSubStep, setTableName) => {
  const dbConnections = getDBConnections()
  for (const clientDeltaDatabaseDataResponse of clientDeltaDatabaseDataArrayResponse) {
    const databaseName = clientDeltaDatabaseDataResponse.database_name
    setSubStep("Updating Response for Sending Client Delta for " + databaseName + " DB")
    const arrayOfUpdatedTablePrimaryKeyArray = clientDeltaDatabaseDataResponse.updated_table_primary_keys
    for (const arrayItemOfUpdatedTablePrimaryKeyArray of arrayOfUpdatedTablePrimaryKeyArray) {
      const tableName = arrayItemOfUpdatedTablePrimaryKeyArray.table_name
      setTableName(tableName)
      const updatedTablePrimaryKeyArray = arrayItemOfUpdatedTablePrimaryKeyArray.upserted_primary_keys
      const primaryKey = dbConnections[databaseName].entities[tableName].primaryColumns[0].propertyName
      console.log('updatedTablePrimaryKeyArray = ', updatedTablePrimaryKeyArray)
      const tableRecordMarkedSyncedResult = await dbConnections[databaseName].repos[tableName]
        .createQueryBuilder()
        .update()
        .set({data_sync_status: 1000101001})
        .where("data_sync_status != 1000101003 and " + primaryKey + " in (:...toBeMarkedSyncedPrimaryKeyIds)", { toBeMarkedSyncedPrimaryKeyIds: updatedTablePrimaryKeyArray })
        .execute()
    }
  }
}

const updateDBBasedOnGetServerDeltaResponse = async (userDeviceId, dbInitialized, referenceTimeFromServer, dbTablesServerDeltaArray, setSubStep, setTableName) => {
  const dbConnections = getDBConnections()
  for (const dbTablesServerDelta of dbTablesServerDeltaArray) {
    const databaseName = dbTablesServerDelta.database_name
    console.log('SS sDB gSD 3, databaseName = ', databaseName)
    setSubStep("Updating Server Delta obtained from Server on to mobile for " + databaseName + " DB")
    const serverDeltaForDBArray = dbTablesServerDelta.server_delta_for_db
    console.log('SS sDB gSD 4')
    for (const serverDeltaForDB of serverDeltaForDBArray) {
      const tableName = serverDeltaForDB.table_name
      console.log('SS sDB gSD 5, tableName = ', tableName)
      setTableName(tableName)
      const tableEntity = dbConnections[databaseName].entities[tableName]
      const tableRepo = dbConnections[databaseName].repos[tableName]
      const primaryKey = tableEntity.primaryColumns[0].propertyName
      const serverDeltaForTable = serverDeltaForDB.server_delta_for_table
      console.log('SS sDB gSD 6')
      if (serverDeltaForTable.length > 0) {
        // const sampleRow = serverDeltaForTable[0]
        // console.log('SS sDB gSD 5a, sampleRow = ', sampleRow)
        // const tableColumns = Object.keys(sampleRow)
        // console.log('SS sDB gSD 5b')
        // delete tableColumns[primaryKey]
        // console.log('SS sDB gSD 5c, serverDeltaForTable = ', serverDeltaForTable)
        const primaryKeysPartOfServerDelta = serverDeltaForTable.map((dbValuesInRow) => dbValuesInRow[primaryKey])
        console.log('SS sDB gSD 7, primaryKeysPartOfServerDelta = ', primaryKeysPartOfServerDelta)
        // get records not part of DB
        const serverDeltaPrimaryKeysAvailableInTableAsRows = await tableRepo
          .createQueryBuilder('client_table')
          .select(["client_table." + primaryKey])
          .where(primaryKey + ' in (:...primaryKeysFromServer)', {primaryKeysFromServer: primaryKeysPartOfServerDelta})
          .getMany()
        console.log('SS sDB gSD 8, serverDeltaPrimaryKeysAvailableInTableAsRows = ', serverDeltaPrimaryKeysAvailableInTableAsRows)
        const serverDeltaPrimaryKeysAvailableInTable = serverDeltaPrimaryKeysAvailableInTableAsRows.map(record => record[primaryKey])
        console.log('SS sDB gSD 8a, serverDeltaPrimaryKeysAvailableInTable = ', serverDeltaPrimaryKeysAvailableInTable)
        const serverDeltaPrimaryKeysToBeInserted = primaryKeysPartOfServerDelta.filter(primaryKey => !serverDeltaPrimaryKeysAvailableInTable.includes(primaryKey))
        console.log('SS sDB gSD 8b, serverDeltaPrimaryKeysToBeInserted = ', serverDeltaPrimaryKeysToBeInserted)
        
        
        const recordsToBeInserted = serverDeltaForTable.filter((individualRow) => serverDeltaPrimaryKeysToBeInserted.includes(individualRow[primaryKey]))
        const recordsToBeUpdated = serverDeltaForTable.filter((individualRow) => serverDeltaPrimaryKeysAvailableInTable.includes(individualRow[primaryKey]))
        console.log('SS sDB gSD 10, recordsToBeInserted = ', recordsToBeInserted)
        console.log('SS sDB gSD 11, recordsToBeUpdated = ', recordsToBeUpdated)
        /*const recordsToBeUpdatedWithoutPrimaryKey = recordsToBeUpdated.map((record) => {
          delete record[primaryKey]
          return record
        })*/

        if (recordsToBeInserted.length > 0) {
          preProcessRecords(tableEntity, recordsToBeInserted, {syncServerDeltaOnMobile: true, syncOperation: "insert"})
          console.log('SS sDB gSD 12, recordsToBeInserted = ', recordsToBeInserted)
          try {
            console.log('SS sDB gSD 13')
            await insertRecordsForEntity(dbConnections, databaseName, tableEntity, recordsToBeInserted)
          } catch (error) {
            console.log('SS sDB gSD 14')
            if (error.message.includes('too many SQL variables')) {
              //iterate one record at a time
              const lengthOfEachBatch = 10
              const recordsToBeInsertedLength = recordsToBeInserted.length
              if (recordsToBeInsertedLength > lengthOfEachBatch) {
                try {
                  let counter = 0
                  let endPoint = 0
                  while (endPoint < recordsToBeInsertedLength) {
                    const startingPoint = counter*lengthOfEachBatch
                    endPoint = startingPoint + lengthOfEachBatch
                    if (endPoint > recordsToBeInsertedLength) {
                      endPoint = recordsToBeInsertedLength
                    }
                    const inLoopRecordsToBeInserted = recordsToBeInserted.slice(startingPoint, endPoint)

                    await insertRecordsForEntity(dbConnections, databaseName, tableEntity, inLoopRecordsToBeInserted)
                    counter++
                  }
                } catch (error) {
                  for (const recordToBeInserted of recordsToBeInserted) {
                    /*const insertTableResults = await dbConnections[
                      databaseName
                    ].manager
                      .createQueryBuilder()
                      .insert()
                      .into(tableEntity)
                      .values(recordToBeInserted)
                      .execute()
                    */
                    await insertRecordsForEntity(dbConnections, databaseName, tableEntity, recordToBeInserted)
                  }
                }
              } else {
                for (const recordToBeInserted of recordsToBeInserted) {
                  await insertRecordsForEntity(dbConnections, databaseName, tableEntity, recordToBeInserted)
                }
              }
            }
          }
        }
        console.log('SS sDB gSD 15, tableEntity.schema = ', tableEntity.schema, ', tableEntity.tableName = ', tableEntity.tableName)
        if (recordsToBeUpdated.length > 0) {
          if (tableEntity.schema === 'main' && tableEntity.tableName === 'document') {
            // select existing record
            // check if client_document_information needs changes
            // update document_sync_status to 1000102003
            console.log('SS sDB gSD 18')
            const documentRowsInDB = await tableRepo
              .createQueryBuilder('document')
              .select(["document." + primaryKey, "document.client_document_information", "document.document_information"])
              .where(primaryKey + ' in (:...primaryKeysFromServer)', {primaryKeysFromServer: serverDeltaPrimaryKeysAvailableInTable})
              .getMany()

            console.log('SS sDB gSD 19')
            for (const documentRowInDB of documentRowsInDB) {
              console.log('SS sDB gSD 20, documentRowInDB = ', documentRowInDB)
              const documentId = documentRowInDB.document_id
              const stringifiedClientDocumentInformationInDBRow = documentRowInDB.client_document_information
              const stringifiedDocumentInformationInDBRow = documentRowInDB.document_information
              let clientDocumentInformationInDBRow = {}
              if (stringifiedClientDocumentInformationInDBRow && stringifiedClientDocumentInformationInDBRow !== null && stringifiedClientDocumentInformationInDBRow !== '') {
                clientDocumentInformationInDBRow = JSON.parse(stringifiedClientDocumentInformationInDBRow)
              }
              const documentInformationInDBRow = JSON.parse(stringifiedDocumentInformationInDBRow)
              const recordToUpdatedRow = recordsToBeUpdated.filter(recordFromServer => recordFromServer.document_id === documentId)
              const recordToUpdated = recordToUpdatedRow[0]
              console.log('SS sDB gSD 21, recordToBeSynced = ', recordToUpdated)
              console.log('SS sDB gSD 22, clientDocumentInformationInDBRow = ', clientDocumentInformationInDBRow)
              preProcessRecords(tableEntity, recordToUpdated, {syncServerDeltaOnMobile: true, syncOperation: "updated"})
              if (clientDocumentInformationInDBRow && (typeof clientDocumentInformationInDBRow === 'object') && Object.keys(clientDocumentInformationInDBRow) > 0) {
                console.log('SS sDB gSD 23')
              } else {
                // there is a problem, need to set document_sync_status to 1000102003
                console.log('SS sDB gSD 24')
                recordToUpdated['document_sync_status'] = 1000102003
              }
              console.log('SS sDB gSD 25, recordToUpdated = ', recordToUpdated)
              const updateTableResults = await tableRepo
                .createQueryBuilder()
                .update()
                .set(recordToUpdated)
                .where(
                  primaryKey +
                    ' = :primaryKeyValue',
                  {
                    primaryKeyValue: documentId,
                  }
                )
                .execute()
              console.log('SS sDB gSD 25')
            }
            console.log('SS sDB gSD 26')
          } else {
            preProcessRecords(tableEntity, recordsToBeUpdated, {syncServerDeltaOnMobile: true, syncOperation: "updated"})
            console.log('SS sDB gSD 16, recordsToBeUpdated = ', recordsToBeUpdated)
            const updateTableResults = tableRepo.save(recordsToBeUpdated)
            console.log('SS sDB gSD 17')
          }
        }

        console.log('SS sDB gSD 19')
        if (!dbInitialized) {
          console.log('SS sDB gSD 20')
          const headers = createHeaders(userDeviceId, 'Set Sync Reference Time For Individual Table')
          const getLastSyncTimeUpdateResult = await updateLastSyncTimeForTables(headers, {sync_reference_time: referenceTimeFromServer, database_and_table_information: [{database_name: databaseName, tables: [tableName]}]})
        }
      }
    }
  }
}

const downloadFilesToMakeItAvaialbleOffline = async (userDeviceId, setTableName) => {
  console.log('s dFTMIAO 1')
  const dbConnections = getDBConnections()
  const documentRepo = dbConnections['main'].repos['document']
  const documentEntity = dbConnections['main'].entities['document']
  const filesNotSyncedDocumentsResult = await documentRepo
    .createQueryBuilder('client_table')
    .select(["document_id", "client_document_information", "document_information"])
    .where({document_sync_status: 1000102003})
    .getRawMany()
  console.log('s dFTMIAO 2')
  for (const filesNotSyncedDocument of filesNotSyncedDocumentsResult) {
    console.log('s dFTMIAO 3, filesNotSyncedDocument = ', filesNotSyncedDocument)
    const stringifiedClientDocumentInformation = filesNotSyncedDocument.client_document_information
    let clientDocumentInformation
    if (stringifiedClientDocumentInformation && stringifiedClientDocumentInformation !== null && stringifiedClientDocumentInformation !== '') {
      console.log('s dFTMIAO 3')
      clientDocumentInformation = JSON.parse(stringifiedClientDocumentInformation)
    }
    const documentId = filesNotSyncedDocument.document_id
    console.log('s dFTMIAO 4, documentId = ', documentId)
    let newClientDocumentInformation = {}
    if (clientDocumentInformation) {
      console.log('s dFTMIAO 5')
      newClientDocumentInformation = {...clientDocumentInformation}
    }
    let documentInformation = {}
    console.log('s dFTMIAO 6')
    const stringifiedDocumentInformation = filesNotSyncedDocument.document_information
    if (stringifiedDocumentInformation && stringifiedDocumentInformation !== null && stringifiedDocumentInformation !== '') {
      console.log('s dFTMIAO 7')
      documentInformation = JSON.parse(stringifiedDocumentInformation)
    }
      // client_document_information = {clientVersion: 1?, localFolderName: "", individualLocalFolderName: "", fileType: "", fileName: "key", localFiles:[{index: 0, order: 1, fileName: "file 1.jpg", deleted: false},
      //                                              {index: 1, order: 0, fileName: "file 2.pdf", deleted: false}]}
      // document_information = {serverVersion: 1, serverFolderName: "", individualServerFolderName: "", fileType: "", fileName: "key", serverFiles: [{index: 0, fileName: "key", deleted: false}, {index: 0, fileName: "key", deleted: false}]}
    const localFiles = []
    if (documentInformation.serverFiles && Array.isArray(documentInformation.serverFiles)) {
      console.log('s dFTMIAO 7a')
      for (const serverFile of documentInformation.serverFiles) {
        console.log('s dFTMIAO 8, documentInformation = ', documentInformation)
        const localFile = {...serverFile}
        setTableName('Downloading ' + serverFile.fileName)
        console.log('s dFTMIAO 9, Downloading ', serverFile.fileName)
        delete localFile['fileKey']
        delete localFile['fileName']
        const originallyPickedFileName = serverFile.pickedFileName
        const localFileName = generateDestinationFileName(originallyPickedFileName)
        const localFileFullPath = RNFS.DocumentDirectoryPath + '/' +
          documentInformation.localFolderName + '/' + localFileName
        //download file name to local file
        const headers = createHeaders(userDeviceId, 'Download File')
        const fileResult = await getFileByKey(headers, serverFile.fileKey) 
        console.log('s dFTMIAO 10, localFileFullPath = ', localFileFullPath)
        try {
          await createFoldersIfNeeded(documentInformation.localFolderName)
          console.log('s dFTMIAO 10a')
          const writeFileResult = await RNFS.writeFile(
            localFileFullPath,
            fileResult,
            'base64',
          )
        } catch (error) {
          console.log('s dFTMIAO 10b, error in saving file')
          console.log('error = ', error)
          throw error
        }
        localFile['fileName'] = localFileName
        console.log('s dFTMIAO 11, saved file')
        localFiles.push(localFile)
      }
    }
    if (localFiles.length > 0) {
      newClientDocumentInformation['localFolderName'] = documentInformation['localFolderName']
      newClientDocumentInformation['individualLocalFolderName'] = documentInformation['individualLocalFolderName']
      newClientDocumentInformation['fileType'] = documentInformation['fileType']
      newClientDocumentInformation['localFiles'] = localFiles
      newClientDocumentInformation['fileName'] = localFiles[0].fileName
    }
    const stringifiedNewClientDocumentInformation = JSON.stringify(newClientDocumentInformation)
    // update document, set clientdocumentinformation, document-syncstatus
    console.log('s dFTMIAO 12 about to update document')
    const documentUpdateResult = await documentRepo
      .createQueryBuilder()
      .update()
      .set({document_sync_status: 1000102001, client_document_information: stringifiedNewClientDocumentInformation})
      // .set({document_information: stringifiedNewDocumentInformation})
      .where({ document_id: documentId })
      .execute()
    console.log('documentUpdateResult = ', documentUpdateResult)
    console.log('s dFTMIAO 13')
  }
  console.log('s dFTMIAO 14')
}

const setLastSyncTimeAsSyncReferenceTimeForTables = async (userDeviceId, referenceTimeFromServer, setSubStep) => {
  const dbConnections = getDBConnections()
  const updateLastSyncTimeData = []
  for (const databaseName in dbConnections) {
    const syncConfiguration = dbConnections[databaseName].syncConfiguration
    if (syncConfiguration && Object.keys(syncConfiguration).length > 0) {
      const oneWaySyncTables = syncConfiguration.one_way_sync_tables
      const twoWaySyncTables = syncConfiguration.two_way_sync_tables
      const allTables = [...oneWaySyncTables, ...twoWaySyncTables]
      updateLastSyncTimeData.push({database_name: databaseName, tables: allTables})
    }
  }
  console.log('setting last sync time as ', referenceTimeFromServer, ' for updateLastSyncTimeData = ', updateLastSyncTimeData)
  if (updateLastSyncTimeData.length > 0) {
    // call update last sync time with this data
    const headers = createHeaders(userDeviceId, 'Setting Last Sync Time')
    setSubStep("Sending Last Sync Time of Tables to Server")
    const getLastSyncTimeUpdateResult = await updateLastSyncTimeForTables(headers, {sync_reference_time: referenceTimeFromServer, database_and_table_information: updateLastSyncTimeData})
  }
}

// figure out a way to queue synchronize DB - have a global flag to indicate that it is running. if it is, queue up requests

const synchronizeDB = async (dispatch, userDeviceId, dbInitialized, setSynchronizationState, setStep, setSubStep, setTableName, setButtonText, setButtonAction, tablesToSync = { serverTables: { main: [], config: []}, clientTables: {main: [], config: []}}) => {
  //  get reference time from server
  //  set mobile reference time (we need to figure out if there was a time change)
  //  iterate through dbs
  //  for each db, get the models which are two way sync models
  //  iterate through each model
  //
  //  check if any record is not synced or being sent (basically the ones which failed)
  //  pick up all those records. mark the sync status to being sent
  //  if so collate those entries
  //  while collating, remove created_at, updated_at. in case of document, additional fields
  //  put everything into json
  //  send this data
  //  as a response, you should the ids that were upserted records. those records mark as synced. any interim updates should mark this as not synced
  //  or
  //  get last mobile sync time for table. If no entry, installation time becomes the reference
  //  pick up all those records and collate them
  //  while collating, remove created_at, updated_at. in case of document, additional fields
  //  put everything into json
  //  send this data
  //  as a response, you should the ids that were upserted records
  //  for the ids which were not received, and updated_at < reference time, mark updated_at as reference time + 1 second
  //  update synchronization table with new mobile sync time for those tables
  //
  //
  //  call get server delta
  //
  //  update synchronization data to the server
  //

  try {
    setSynchronizationState(2)
    const dbConnections = getDBConnections()

    const serverTableToSync = tablesToSync.serverTables
    const clientTableToSync = tablesToSync.clientTables

    // get reference time
    setStep("Getting Synchronization Reference Time")
    const referenceTimeFromServer = await getSyncReferenceTimeFromServer(userDeviceId)
    console.log('referenceTimeFromServer = ', referenceTimeFromServer)
    // get reference time on client
    const referenceTimeOnClient = new Date()
    setStep("Obtained Synchronization Reference Time")

    // send client delta
    setStep("Sending Client Delta")
    setSubStep("Uploading Not Synched Files")
    await uploadNotSyncedFiles(setTableName)
    setTableName('')
    setSubStep("Collating Client Delta")
    const clientDelta = await collateClientDeltaAcrossTables(setSubStep, setTableName, clientTableToSync)
    setSubStep("Sending Client Delta")
    if (clientDelta.length > 0) {
      const headers = createHeaders(userDeviceId, 'Send Client Delta')
      const sentClientDeltaResult = await sendClientDeltaForSync(headers, {sync_reference_time: referenceTimeFromServer, client_delta: clientDelta})
      setSubStep("Updating Response for Sending Client Delta")
      if (sentClientDeltaResult.return_code === 0) {
        const clientDeltaDatabaseDataArray = sentClientDeltaResult.database_client_data_return_values
        await updateRecordsBasedOnResponseOfSendingClientDelta(clientDeltaDatabaseDataArray, setSubStep, setTableName)
      } else {
        // error condition
        throw new Error('send client delta did not work')
      }
    }
    setTableName('')
    setSubStep('')
    setStep("Sending Client Delta Completed")
    /*if (sentClientDeltaResult.list_data && Array.isArray(sentClientDeltaResult.list_data) && sentClientDeltaResult.list_data.length > 0) {
      // update records to marked for sending
    }*/
    setSubStep("Getting Server Delta")
    setSubStep("Getting Server Delta from the server")
    const getServerDeltaHeaders = createHeaders(userDeviceId, 'Get Server Delta')
    const getServerDeltaResult = await getServerDeltaForSync(getServerDeltaHeaders, {sync_reference_time: referenceTimeFromServer, database_and_table_information: serverTableToSync})
    console.log('getServerDeltaResult = ', getServerDeltaResult)
    setSubStep("Obtained Server Delta from Server")
    if (getServerDeltaResult.return_code === 0) {
      setSubStep("Updating Server Delta obtained from Server on to mobile")
      const dbTablesServerDeltaArray = getServerDeltaResult.data
      await updateDBBasedOnGetServerDeltaResponse(userDeviceId, dbInitialized, referenceTimeFromServer, dbTablesServerDeltaArray, setSubStep, setTableName)
    } else {
      throw new Error('Problem in server side sync')
    }
    setSubStep('Downloading Necessary Files')
    const documentResults = await dbConnections.main.manager.query('select * from document')
    await downloadFilesToMakeItAvaialbleOffline(userDeviceId, setTableName)
    setTableName('')
    setSubStep('')
    setStep("Obtained Server Delta")

    // for all the tables that are updated, set last sync time as reference time
    setStep("Updating Last Sync Time on Server")
    setSubStep("Collating Tables")
    await setLastSyncTimeAsSyncReferenceTimeForTables(userDeviceId, referenceTimeFromServer, setSubStep)
    setSubStep('')
    setStep("Completed Updating Last Sync Time on Server")
    // since db is initialized move to home screen???? what should happen if sync is triggered from the sync screen
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.LOAD_REFERENCE_DATA_MESSAGE_SCREEN))
    dispatch(setDBInitialization(true))
  } catch (error) {
    setStep('Error in Synchronization')
    setSubStep('Please try restarting the app again')
    console.log('error in synchronization a')
    console.log('error = ', error)
    console.log('error in synchronization b')
    setSynchronizationState(3)
  }
}

const manageSendingInitialMasterDataSyncTimeToServer = async (dispatch, initialMasterDataSyncTimeSentState) => {
  if (!initialMasterDataSyncTimeSentState) {
    await collateAndSendInitialMasterDataSyncTimeToServer()
    dispatch(setInitialMasterDataSyncTimeSentState(true))
  }
  dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.SYNCHRONIZATION_SCREEN_AS_DB_NOT_INITIALIZED_THROUGH_SYNC))
}

const collateAndSendInitialMasterDataSyncTimeToServer = async () => {
  try {
    const dbConnections = getDBConnections()
    for (const databaseName in dbConnections) {
      const dbSyncConfiguration = dbConnections[dbConnectionName].syncConfiguration
      const tablesToSendInitialSyncDataToServer = (dbSyncConfiguration && dbSyncConfiguration.sync_times_to_be_sent_on_initial_upload) ? dbSyncConfiguration.sync_times_to_be_sent_on_initial_upload : []
      let maxUpdatedAtAcrossTables = null
      for (const tableName in tablesToSendInitialSyncDataToServer) {
        const maxTimeQuery = `select max(updated_at) as max_updated_at from ${tableName}`
        const maxUpdatedTimeForTableResult = await dbConnections[databaseName].manager.query(maxTimeQuery)
        const maxUpdatedAtForTable = maxUpdatedTimeForTableResult[0].max_updated_at
        if (maxUpdatedAtForTable && maxUpdatedAtForTable !== null) {
          if (maxUpdatedAtAcrossTables === null || maxUpdatedAtForTable > maxUpdatedAtAcrossTables) {
            maxUpdatedAtAcrossTables = maxUpdatedAtForTable
          }
        }
      }
      if (maxUpdatedAtAcrossTables !== null) {
        const headers = createHeaders(userDeviceId, 'Set Sync Reference Time For Initially Loaded Masters')
        const getLastSyncTimeUpdateResult = await updateLastSyncTimeForTables(headers, {sync_reference_time: maxUpdatedAtAcrossTables, database_and_table_information: [{database_name: databaseName, tables: tablesToSendInitialSyncDataToServer}]})
      }
    }
  } catch (error) {
    console.log('error in sending last sync time of initially loaded masters, error = ', error)
    console.log('not a problem, continue, sync will take care of this')
  }
}

module.exports = { synchronizeDB, collateAndSendInitialMasterDataSyncTimeToServer, manageSendingInitialMasterDataSyncTimeToServer }