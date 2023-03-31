import { PermissionsAndroid } from "react-native";
import {
  getApiLevel,
} from 'react-native-device-info'

const { INITIALIZATION_SCREEN_STATES } = require('./constants')
import { setInitializationState } from '../redux/actions/appStateOnPhone';

const { sleepInMillis } = require('../../globalFunctions')

const checkCameraPermission = async () => {
  console.log('c p cCP 1')
  const arrayOfPermissions = [
    'android.permission.CAMERA',
  ]
  console.log('c p cCP 2')
  const permissionRequestReturnValue = await PermissionsAndroid.request(
    'android.permission.CAMERA',
    {
      title: "Enable to take pictures",
      message:
        "You will need for debugging any issues you may have on your mobile",
      // buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK"
    }
  )
  console.log('c p cCP 3')
  // console.log('permissions, permissionRequestReturnValue = ', permissionRequestReturnValue)
  let permissionReturnValue = 'authorized'
  for (const permission of arrayOfPermissions) {
    if (permissionRequestReturnValue[permission] !== 'granted') {
      permissionReturnValue = 'not-authorized'
    }
  }
}

const checkWritePermissionToExternalFolder = async () => {
  const apiLevel  =await getApiLevel()
  const arrayOfPermissions = (apiLevel >= 31) ? [
    'android.permission.MANAGE_EXTERNAL_STORAGE',
  ] :
  [
    'android.permission.WRITE_EXTERNAL_STORAGE'
  ]
  // const granted = await PermissionsAndroid.request(
  //    android.permission.READ_EXTERNAL_STORAGE,
  const permissionRequestReturnValue = await PermissionsAndroid.requestMultiple(
    arrayOfPermissions,
    {
      title: "Enable choosing Images, Gallery",
      message:
        "You will need for debugging any issues you may have on your mobile",
      // buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK"
    }
  )
  // console.log('permissions, permissionRequestReturnValue = ', permissionRequestReturnValue)
  let permissionReturnValue = 'authorized'
  for (const permission of arrayOfPermissions) {
    if (permissionRequestReturnValue[permission] !== 'granted') {
      permissionReturnValue = 'not-authorized'
    }
  }
  return permissionReturnValue
  /*if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    return "authorized"
  } else {
    return "not-authorized"
  }*/
}

const checkReadPermissionToExternalFolder = async () => {
  const apiLevel  =await getApiLevel()
  const arrayOfPermissions = (apiLevel >= 33) ? ['android.permission.READ_MEDIA_IMAGES',
    'android.permission.READ_MEDIA_VIDEO',
    'android.permission.READ_MEDIA_AUDIO'
  ] :
  [
    'android.permission.READ_EXTERNAL_STORAGE'
  ]
  // const granted = await PermissionsAndroid.request(
  //    android.permission.READ_EXTERNAL_STORAGE,
  const permissionRequestReturnValue = await PermissionsAndroid.requestMultiple(
    arrayOfPermissions,
    {
      title: "Enable choosing Images, Gallery",
      message:
        "You will need for debugging any issues you may have on your mobile",
      // buttonNeutral: "Ask Me Later",
      buttonNegative: "Cancel",
      buttonPositive: "OK"
    }
  )
  // console.log('permissions, permissionRequestReturnValue = ', permissionRequestReturnValue)
  let permissionReturnValue = 'authorized'
  for (const permission of arrayOfPermissions) {
    if (permissionRequestReturnValue[permission] !== 'granted') {
      permissionReturnValue = 'not-authorized'
    }
  }
  return permissionReturnValue
  /*if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    return "authorized"
  } else {
    return "not-authorized"
  }*/
}

const checkAppropriatePermissions = async (dispatch) => {
  // permissions for farmer
  // access camera, read documents, read images
  // debug time -> write to folder

  // permissions for paravet
  // access camera, read documents, read images, location
  // debug time -> write to folder
  await sleepInMillis(1000)
  dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.INFORM_ABOUT_PERMISSION_SCREEN))
  await sleepInMillis(1000)
  try {
    const permissionLevel = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)

    if (!permissionLevel) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION/*,
        {
          'title': 'Krushal',
          'message': 'Needs to show your location to farmers'
        }*/
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.HOME_SCREEN_POST_DB_INITIALIZATION_THROUGH_SYNC))  
        console.log("You can use the location")
        // alert("You can use the location");
      } else {
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.PERMISSION_DENIED_MESSAGE_SCREEN))
        console.log("location permission denied")
        // alert("Location permission denied");
      }
    } else {
      // permission not granted for now
      dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.HOME_SCREEN_POST_DB_INITIALIZATION_THROUGH_SYNC))  
    }
  } catch (err) {
    console.log(err)
  }
}

module.exports = { checkWritePermissionToExternalFolder, checkReadPermissionToExternalFolder, checkCameraPermission, checkAppropriatePermissions }