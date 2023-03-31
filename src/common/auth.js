import { getDBConnections } from '@krushal-it/ah-orm';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging'
import { current } from '@reduxjs/toolkit';
import {
  getAndroidId,
  getApiLevel,
  getDeviceName,
  getInstanceId,
  getManufacturer,
  getBrand,
  getDeviceId,
  getModel,
  getSystemVersion,
} from 'react-native-device-info'

const { createHeaders } = require('@krushal-it/common-core')


import { setDBInitialization, setInitializationState, setLoggedInUserInformation, setLoggedInUserDeviceId, setUserLanguage, setInitialMasterDataSyncTimeSentState, setFCMTokenInformation, setFCMTokenFlag } from '../redux/actions/appStateOnPhone';
const { trimPhoneNumberToRight10Numbers } = require('./utils')
const {loginMobileUser, sendFCMTokenToServer} = require('../router/router')
const {INITIALIZATION_SCREEN_STATES} = require('./constants')
// const { loadReferences } = require('./referencedata')
const { collateAndSendInitialMasterDataSyncTimeToServer } = require('./synchronization')
const { sleepInMillis } = require('../../globalFunctions')

const signOut = async (dispatch) => {
  dispatch(setLoggedInUserDeviceId(-1))
  dispatch(setDBInitialization(false))
  dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHOOSE_LANGUAGE_SCREEN))
  try {
    await auth().signOut()
  } catch (error) {
  }
  try {
    await auth().signOut()
  } catch (error) {
  }
}

const setupUserDevice = async () => {
  // get device id, instance id, device information
  // once logged in, identify user device id by entity type / entity id + instanceId
  // we need one entry at least per instance
  // entity type, entity id, uid, instanceId, deviceId should be the columns
  // send the data
  // do a check on phone number again
  // if instanceId + entity type + entity id match, update uid and other details. else insert
  // to identify entity type + entity id, search staff and customer database for phone number
  // return device id
  try {
    const uid = auth().currentUser.uid
    const phoneNumber = auth().currentUser.phoneNumber
    const trimmedPhoneNumber = trimPhoneNumberToRight10Numbers(phoneNumber)
    const androidId = await getAndroidId()
    const instanceId = await getInstanceId()
    const deviceId = getDeviceId()
    const phoneDeviceName = await getDeviceName()
    const phoneManufacturer = await getManufacturer()
    const phoneBrand = getBrand()
    const phoneModel = getModel()

    const phoneSystemVersion = getSystemVersion()
    const phoneAPILevel = await getApiLevel()

    const deviceData = {
      identity: {
        instanceId: instanceId,
        uid: uid,
        androidId: androidId,
        deviceId: deviceId,
      },
      phoneHardware: {
        deviceName: phoneDeviceName,
        manufacturer: phoneManufacturer,
        brand: phoneBrand,
        model: phoneModel,
      },
      phoneSoftware: {
        systemVersion: phoneSystemVersion,
        apiLevel: phoneAPILevel,
      },
    }

    const userDeviceData = {
      phoneNumber: trimmedPhoneNumber,
      uid: uid,
      instance_id: instanceId,
      device_id: deviceId,
      device_information: deviceData,
    }

    const headers = createHeaders(deviceId, 'Login user using mobile number')
    const result = await loginMobileUser(headers, userDeviceData)
    return result
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

global.authCheckTime = null

const manageAuthenticationScreenFlow = async (dispatch, dbInitialized, userDeviceId, lastLoggedUserUserTypeId, lastLoggedInUserId/*, fcmTokenInStore, fcmTokenSentFlagInStore*/) => {
  console.log('a MASF 0')
  let newUserDeviceId = userDeviceId
  /// setCheckAuthentication(0)
  const unsubscribe = auth().onAuthStateChanged(async (user) => {
    // if user device is -1, then don't 
    console.log('a mASF 1, dbInitialized = ', dbInitialized, ', userDeviceId = ', userDeviceId, ', user = ', user)
    if (user && userDeviceId === -1) {
      const deviceCreationResult = await setupUserDevice()
      if (
        deviceCreationResult.return_code &&
        deviceCreationResult.return_code >= 0
      ) {
        // console.log('a mASF 3, lastLoggedUserUserTypeId = ', lastLoggedUserUserTypeId, ', lastLoggedInUserId = ', lastLoggedInUserId)
        if (lastLoggedUserUserTypeId !== deviceCreationResult.user_type_id && lastLoggedInUserId !== deviceCreationResult.user_id) {
          // clear all tables except non-geography based masters
          // console.log('a mASF 3, previous user is different, clear tables that can be cleared')
          const dbConnections = getDBConnections()
          for (const dbConnectionName in dbConnections) {
            // console.log('a mASF 4, clearning tables in ', dbConnectionName)
            const dbSyncConfiguration = dbConnections[dbConnectionName].syncConfiguration
            const tablesNotToDelete = (dbSyncConfiguration && dbSyncConfiguration.tables_not_to_deleted_on_user_change) ? dbSyncConfiguration.tables_not_to_deleted_on_user_change : []
            for (const tableName in dbConnections[dbConnectionName].entities) {
              if (!tablesNotToDelete.includes[tableName]) {
                // console.log('a mASF 5, clearing table ', tableName)
                await dbConnections[dbConnectionName].manager.query('delete from ' + tableName)
              }
            }
          }
        }
        dispatch(setDBInitialization(false))
        // dispatch(setUserLanguage('en'))
        newUserDeviceId = deviceCreationResult.user_device_id
        dispatch(setLoggedInUserInformation(deviceCreationResult.user_type_id, deviceCreationResult.user_id, deviceCreationResult.user_device_id))
        await sleepInMillis(1000)

        console.log('a mASF 10')
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_FCM_FLOW_SCREEN))
      } else {
        // console.log('a mASF 6')
        if (
          deviceCreationResult.return_code &&
          deviceCreationResult.return_code === -1
        ) {
          try {
            dispatch(setLoggedInUserDeviceId(-1))
            await auth().signOut()
            await auth().currentUser.delete()
          } catch (error) {
            console.log('a mASF 7, error in trying to signout and delete user')
          }
          dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.MESSAGE_PHONE_NUMBER_NOT_AVAILABLE_IN_SYSTEM_SCREEN))
        } else {
          // console.log('a mASF 8, setting initialization State to 8')
          dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.AUTHENTICATION_PROBLEM_SCREEN))
        }
      }

      // await checkAndUpdateFCMTokenOnServer(dispatch, newUserDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore)

      // if (dbInitialized) {
        // since db is initialized move to home screen
        // 
        // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.HOME_SCREEN_POST_DB_INITIALIZATION_THROUGH_SYNC))
      // } else {
      //   dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.SYNCHRONIZATION_SCREEN_AS_DB_NOT_INITIALIZED_THROUGH_SYNC))
      // }
    } else if (userDeviceId < 0) {
      // no user logged in. currentUser is null.
      // if (user === null) {
      dispatch(setDBInitialization(false))
      // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.PHONE_NUMBER_ENTRY_SCREEN))
      dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHOOSE_LANGUAGE_SCREEN))
      // }
    } else {
      // await checkAndUpdateFCMTokenOnServer(dispatch, newUserDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore)
      const currentDate = new Date()
      const diffTimeInMillis = global.authCheckTime ? currentDate - global.authCheckTime : 10000
      console.log('a mASF 9, currentDate = ', currentDate, ', global.authCheckTime = ', global.authCheckTime, ', currentDate - global.authCheckTime = ', diffTimeInMillis)
      if (diffTimeInMillis > 5000) {
        global.authCheckTime = currentDate
        await sleepInMillis(1000)
        console.log('a mASF 11')
        dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_FCM_FLOW_SCREEN))
      } else {
        console.log('a mASF 12, ignored')
      }
      // if (dbInitialized) {
        // since db is initialized move to home screen
        // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.HOME_SCREEN_POST_DB_INITIALIZATION_THROUGH_SYNC))
        // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.LOAD_REFERENCE_DATA_MESSAGE_SCREEN))
      // } else {
        
        // check if master data is not sent, if so send master data sync times
      //  dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_INITIAL_MASTER_DATA_SYNC_TIME_SENT_TIME_SCREEN))
      //   }
    }
  })

  unsubscribe
}

module.exports = {signOut, manageAuthenticationScreenFlow}