const { configurationJSON } = require('@krushal-it/common-core')
const RNFS = require('react-native-fs');
const {checkWritePermissionToExternalFolder} = require('./permission')
import * as ScopedStorage from 'react-native-scoped-storage';
import {
  getApiLevel,
} from 'react-native-device-info'

import {
  setInitializationState, setUserDataDirectory
} from '../redux/actions/appStateOnPhone'
import { INITIALIZATION_SCREEN_STATES } from './constants';

const { sleepInMillis } = require('../../globalFunctions')

const DBBackUpIndividualDBToMobilePublic = () => {
  const directoryToCreate = RNFS.DocumentDirectoryPath + folderPath
}

const DBBackUpToMobilePublic = async (apiLevel, userDataDirectoryURI, databaseNameArray) => {
  if (databaseNameArray && Array.isArray(databaseNameArray)) {
    // iterate through names and take backup
  } else {
    // take back of all
    const basePathForFiles = RNFS.DocumentDirectoryPath
    const basePathForDatabases = basePathForFiles.replace("/files", "/databases")
    const databaseNames = ["main.db", "config.db"]
    // const databaseNames = ["main.db"]
    for (const databaseName of databaseNames) {
      const sourceFileName = basePathForDatabases + "/" + databaseName
      if (apiLevel < 31) {
        const destinationFileName = RNFS.DownloadDirectoryPath + "/" + databaseName
        const copyResult = await RNFS.copyFile(
          sourceFileName,
          destinationFileName,
        )
      } else {
        const dbContentsAsBase64 = await RNFS.readFile(sourceFileName, 'base64')
        // const copyFileResult = await ScopedStorage.writeFile(userDataDirectoryURI, 'helloworld2.txt', 'text/plain', text2)
        const copyFileResult = await ScopedStorage.writeFile(userDataDirectoryURI, dbContentsAsBase64, databaseName, 'application/octet-stream', 'base64')
        // const copyFileResult = await ScopedStorage.copyFile('file://' + sourceFileName, userDataDirectoryURI)
      }
    }
  }
}

const OptionallyTakeDBBackup = async (dispatch, persistentAppStateOnPhone) => {
  // console.log('ddb otdbb 1')
  let returnValue = 0
  if (configurationJSON().DB_BACKUP && Array.isArray(configurationJSON().DB_BACKUP) && configurationJSON().DB_BACKUP.length > 0) {
    returnValue = 1
    for (const dbBackConfiguration of configurationJSON().DB_BACKUP) {
      dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CONFIGURED_TO_TAKE_BACKUP_TAKING_BACKUP_MESSAGE_SCREEN))
      if (dbBackConfiguration.DESTINATION === 'local') {
        // check read permission
        // if not, go to 3003
        // if permitted, go to 3001
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_PERMISSION_FOR_BACKUP_SCREEN))
        const apiLevel  =await getApiLevel()
        if (apiLevel >= 31) {
          dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CONFIGURED_TO_TAKE_BACKUP_TAKING_BACKUP_MESSAGE_SCREEN))
          try {
            // console.log('ddb otdbb 2')
            const persistedUris = await ScopedStorage.getPersistedUriPermissions(); // List of all uris where the app has access to read/write
            // console.log('ddb otdbb 2a, persistedUris = ', persistedUris)
            let userDataDirectory = persistentAppStateOnPhone.userDataDirectory
            // console.log('ddb otdbb 3, userDataDirectory = ', userDataDirectory)
            let getScopedSourceFolder = false
            if (userDataDirectory === '' || userDataDirectory === null || userDataDirectory === 'null') {
              getScopedSourceFolder = true
            } else {
              // console.log('ddb otdbb 4')
              userDataDirectory = JSON.parse(userDataDirectory)
              const userDataDirectoryURI = userDataDirectory.uri
              if (persistedUris.indexOf(userDataDirectoryURI) !== -1) {
                // do nothing
                // console.log('ddb otdbb 6')
              } else {
                // console.log('ddb otdbb 7')
                dispatch(setUserDataDirectory(''))
                getScopedSourceFolder = true
                await sleepInMillis(3000)
              }
            }
            // console.log('ddb otdbb 8')
            if (getScopedSourceFolder) {
              // console.log('ddb otdbb 9')
              userDataDirectory = await ScopedStorage.openDocumentTree(true);
              const userDataDirectoryURI = userDataDirectory.uri
              // console.log('ddb otdbb 10, userDataDirectory = ', userDataDirectory)
              const indexToDocumentSlash = userDataDirectoryURI.indexOf('/document/')
              const withoutExtractedFolder = userDataDirectoryURI.substr(0, indexToDocumentSlash)
              userDataDirectory.uri = withoutExtractedFolder
              // console.log('ddb otdbb 11, withoutExtractedFolder = ', withoutExtractedFolder)
              dispatch(setUserDataDirectory(JSON.stringify(userDataDirectory)))
              // console.log('ddb otdbb 12')
            }
            // console.log('ddb otdbb 13')
            const dbBackupResponse = await DBBackUpToMobilePublic(apiLevel, userDataDirectory.uri)
            // console.log('ddb otdbb 14')
          } catch (error) {
            // console.log('ddb otdbb 15, error = ', error)
            dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.ERROR_IN_TAKING_BACKUP_MESSAGE_SCREEN))
          }
        } else {
          const storagePermission = await checkWritePermissionToExternalFolder()

          dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CONFIGURED_TO_TAKE_BACKUP_TAKING_BACKUP_MESSAGE_SCREEN))
          if (storagePermission !== 'authorized') {
            // go to 3003
            dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CONFIGURED_TO_TAKE_BACKUP_BUT_NO_PERMISSION_TO_BACKUP_MESSAGE_SCREEN))
            returnValue = -1
          } else {
            // go to 3001
            try {
              const dbBackupResponse = await DBBackUpToMobilePublic(apiLevel, undefined)
            } catch (error) {
              dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.ERROR_IN_TAKING_BACKUP_MESSAGE_SCREEN))
            }
          }
        }
      }
    }
  }
  return returnValue
}

module.exports = {OptionallyTakeDBBackup}