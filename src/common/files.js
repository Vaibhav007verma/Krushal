const RNFS = require('react-native-fs')
const uuid = require('uuid')
const {configurationJSON} = require('@krushal-it/common-core')

const generateDestinationFileName = (destinationFileName) => {
  const dotsSplitArray = destinationFileName.split('.')
  const numberOfDotSplits = dotsSplitArray.length
  if (numberOfDotSplits === 1) {
    return destinationFileName + uuid.default.v1()
  } else {
    const dotsSplitMinusLast = dotsSplitArray.slice(0, -1)
    const joinedFileNameWithoutExtension = dotsSplitMinusLast.join('.')
    return (
      joinedFileNameWithoutExtension +
      '-' +
      uuid.default.v1() +
      '.' +
      dotsSplitArray[numberOfDotSplits - 1]
    )
  }
}

const createFoldersIfNeeded = async (destinationFolderPath) => {
  if (
    !destinationFolderPath ||
    destinationFolderPath === null ||
    destinationFolderPath === ''
  ) {
    return
  }
  const foldersAsArray = destinationFolderPath.split('/')
  let folderPath = ''
  for (folder of foldersAsArray) {
    folderPath = folderPath + '/' + folder
    const directoryToCreate = RNFS.DocumentDirectoryPath + folderPath
    try {
      childFolderContent = await RNFS.mkdir(directoryToCreate)
    } catch (error) {
      // console.log('C f cFiN 8, in case folder already exists')
    }
  }
}
const copyFromSourceURIToDestinationFolderFile = async (
  sourceFileURI,
  destinationFolderPath,
  destinationFileName,
) => {
  await createFoldersIfNeeded(destinationFolderPath)
  const positionOfinDotKrushalIndex = sourceFileURI.indexOf('in.krushal')
  const restOfString = sourceFileURI.substr(positionOfinDotKrushalIndex)
  const positionOfSlashInRestOfString = restOfString.indexOf('/')
  let filePathWithoutFiles = RNFS.DocumentDirectoryPath
  const lengthOfFilesString = '/files'.length
  filePathWithoutFiles = filePathWithoutFiles.slice(
    0,
    filePathWithoutFiles.length - lengthOfFilesString,
  )
  const sourceFileName =
    filePathWithoutFiles +
    '/' +
    restOfString.substr(positionOfSlashInRestOfString + 1)
  const destinationFileNameWithPath =
    RNFS.DocumentDirectoryPath +
    '/' +
    destinationFolderPath +
    '/' +
    destinationFileName
  const copyResult = await RNFS.copyFile(
    sourceFileName,
    destinationFileNameWithPath,
  )
  return destinationFileNameWithPath
}

const storeFileFromStream = async (
  destinationFolderPath,
  destinationFileName,
  sourceStream,
) => {
  const destinationFileNameWithPath =
    RNFS.DocumentDirectoryPath +
    '/' +
    destinationFolderPath +
    '/' +
    destinationFileName
  // const sourceStreamB64 = Buffer.from(sourceStream, 'base64')
  const writeFileResult = await RNFS.writeFile(
    destinationFileNameWithPath,
    sourceStream,
    'base64',
  )
  return destinationFileNameWithPath
}

const uploadFileToS3 = async (destinationFileName, destinationFileNameWithPath, fileType) => {
  const files = [
    {
      name: 'file',
      filename: destinationFileName,
      filepath: destinationFileNameWithPath,
      filetype: fileType,
    },
  ]

  const uploadBegin = response => {
    const jobId = response.jobId
    console.log('UPLOAD HAS BEGUN! JobId: ' + jobId)
  }

  const uploadProgress = response => {
    const percentage = Math.floor(
      (response.totalBytesSent / response.totalBytesExpectedToSend) *
        100,
    )
    // console.log('UPLOAD IS ' + percentage + '% DONE!')
  }
  const uploadUrl =
    configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
    '/v2/file'

  // upload files
  const fileUploadResponse = await RNFS.uploadFiles({
    toUrl: uploadUrl,
    files: files,
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    fields: {
      test: 'ping',
    },
    begin: uploadBegin,
    progress: uploadProgress,
  })
  const fileUploadResponse2 = await fileUploadResponse.promise
  const fileUploadBody = JSON.parse(fileUploadResponse2.body)
  if (
    fileUploadBody &&
    fileUploadBody.data &&
    fileUploadBody.data.result
  ) {
    console.log('FILES UPLOADED!') // response.statusCode, response.headers, response.body
  } else {
    console.log('SERVER ERROR')
  }
  console.log('file uploaded')

  const s3FileKey = fileUploadBody.data.doc_key
  return s3FileKey
}

module.exports = {
  copyFromSourceURIToDestinationFolderFile,
  generateDestinationFileName,
  storeFileFromStream,
  uploadFileToS3,
  createFoldersIfNeeded
}
