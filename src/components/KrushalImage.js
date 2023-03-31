import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  FlatList,
  View,
  Image,
} from 'react-native'

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

const { getFile } = require('../router/router')
const { storeFileFromStream } = require('../common/files')
const RNFS = require('react-native-fs')

const KrushalImage = (props) => {
  const passableProps = { ...props }
  const placeHolderImageURI = props.placeHolderImageURI
  const document_id = props.document_id
  const localFileURI = props.localFileURI
  const localFolderName = props.localFolderName

  delete passableProps.placeHolderImageURI
  delete passableProps.document_id
  delete passableProps.localFileURI
  delete passableProps.localFolderName

  // const [imageDownloaded, setImageDownloaded] = useState(1)
  // const [localSourceFileURI, setLocalSourceFileURI] = useState(
  //   localFileURI
  // )
  const [localSourceFileName, setLocalSourceFileName] = useState(null)

  const persistentAppStateOnPhone = useSelector(
    (state) => state.persistentAppStateOnPhone
  )
  const userDeviceId = persistentAppStateOnPhone.userDeviceId
  // console.log('KI c 2, localSourceFileURI = ', localSourceFileURI, ', localFileURI = ', localFileURI)
  // if (localSourceFileURI === null && localFileURI !== null) {
  //   console.log('KI c forcing local source')
  //   setLocalSourceFileURI(localFileURI)
  //   setImageDownloaded(imageDownloaded + 1)
  // }
  // useEffect(() => {
  //   const loadImage = async () => {
  //     // in case u want a delay
  //     console.log('KI uE iD 3, document_id = ', document_id, ', localSourceFileURI = ', localSourceFileURI)
  //     if (document_id !== -1 && localSourceFileURI !== null) {
  //       console.log('KI uE iD 4')
  //       const localSourceFileWithoutURI = localSourceFileURI.substr(7)
  //       console.log('KI uE iD 5')
  //       // const destinationFileFullPath = RNFS.DocumentDirectoryPath + '/' + imageFolderName + '/' + localSourceFileName
  //       const isDocumentIdFileOnLocalMachine = await RNFS.exists(
  //         localSourceFileWithoutURI,
  //       )
  //       if (isDocumentIdFileOnLocalMachine) {
  //         console.log('reusing existing file')
  //         setLocalSourceFileURI(localSourceFileURI)
  //         setImageDownloaded(0)
  //       } else if (!isDocumentIdFileOnLocalMachine) {
  //         const headers = createHeaders(userDeviceId, 'Get File')
  //         const fileResult = await getFile(headers, document_id)

  //         const writeFileResult = await RNFS.writeFile(
  //           localSourceFileWithoutURI,
  //           fileResult,
  //           'base64',
  //         )
  //         setLocalSourceFileURI(localFileURI)
  //         setImageDownloaded(0)
  //       }
  //     }
  //   }
  //   console.log('KI uE iD 1')
  //   if (imageDownloaded === 0) {
  //     console.log('KI uE iD 2')
  //     loadImage()
  //   }
  // }, [imageDownloaded])

  if (props.localFileURI) {
    return (
      <Image
        style={{ width: 150, height: 50, resizeMode: 'contain' }}
        source={{ uri: props.localFileURI }}
        {...passableProps}
      ></Image>
    )
  } else {
    return <Image source={placeHolderImageURI} {...passableProps}></Image>
  }
}
module.exports = { KrushalImage }
