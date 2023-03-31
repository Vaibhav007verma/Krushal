import messaging from '@react-native-firebase/messaging'


const { createHeaders } = require('@krushal-it/common-core')

import { setDBInitialization, setInitializationState, setLoggedInUserInformation, setLoggedInUserDeviceId, setUserLanguage, setInitialMasterDataSyncTimeSentState, setFCMTokenInformation, setFCMTokenFlag } from '../redux/actions/appStateOnPhone';
const {INITIALIZATION_SCREEN_STATES} = require('./constants')
const { sleepInMillis } = require('../../globalFunctions')
const {loginMobileUser, sendFCMTokenToServer} = require('../router/router')


const registerForPushNotifications = async () => {
  const enabled = await messaging().hasPermission()
  if (!enabled) {
    try {
      await messaging().requestPermission()
    } catch (error) {
      console.log('f rFPN 5, Error while requesting permission: ', error)
    }
  }
  const fcmToken = await messaging().getToken()
  return fcmToken
}

const afterAuthSendFCMTokenToServer = async (dispatch, userDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore, fcmToken) => {
  // check fcmToken against that in store
  // if same, check if flag indicates sent. if sent, don't do anything
  // if fcmToken is not the same as in store, setToken into store and flag as not set
  // if fcmToken is not the same as in store, or sent flag is not sent
  // send fcmToken to server
  // wait for receipt
  // on confirmed receipt, update sentFlag as true
  try {
    // console.log('f aASFTTS 2, userDeviceId = ', userDeviceId, ', fcmTokenInStore = ', fcmTokenInStore, ', fcmTokenSentFlagInStore = ', fcmTokenSentFlagInStore, ', fcmToken = ', fcmToken)
    if (fcmToken !== fcmTokenInStore) {
      dispatch(setFCMTokenInformation(fcmToken, false))
      // delay by a second??
    }

    if (fcmToken !== fcmTokenInStore || !fcmTokenSentFlagInStore) {
      const headers = createHeaders(userDeviceId, 'Register FCM Token')
      const result = await sendFCMTokenToServer(headers, {fcmToken: fcmToken})
      if (result.return_code === 0) {
        dispatch(setFCMTokenFlag(true))
      }
    }
  } catch (error) {
    console.log('f aASFTTS 11, error')
    console.log('f aASFTTS 12, error = ', error)
    console.log('Error in sending FCM Token to Server')
  }
}


const manageFCMFlow = async (dispatch, dbInitialized, userDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore) => {
  try {
    await sleepInMillis(1000)
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_FCM_PERMISSION_SCREEN))
    const fcmToken = await registerForPushNotifications()
    // sleepInMillis(1000)
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.COMPARE_AND_SEND_FCM_TOKEN_SCREEN))
    // sleepInMillis(1000)
    await afterAuthSendFCMTokenToServer(dispatch, userDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore, fcmToken)
    messaging().onTokenRefresh(async (fcmToken) => {
      console.log('Token refreshed: ', fcmToken)
      // You should send the updated token to the backend server here
      // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.COMPARE_AND_SEND_FCM_TOKEN_SCREEN))
      await afterAuthSendFCMTokenToServer(dispatch, userDeviceId, fcmTokenInStore, fcmTokenSentFlagInStore, fcmToken)
    })
  } catch (error) {
    console.log('f mFF 10, error')
    console.log('f mFF 11, error = ', error)
  }
  // sleepInMillis(1000)
  if (dbInitialized) {
    // load reference
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.LOAD_REFERENCE_DATA_MESSAGE_SCREEN))
  } else {
    // db sync screen
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_INITIAL_MASTER_DATA_SYNC_TIME_SENT_TIME_SCREEN))
  }
}

module.exports = { manageFCMFlow }