const DB_INITIALIZED = "DB_INITIALIZED"
const LOGGED_IN_USER_INFORMATION = 'LOGGED_IN_USER_INFORMATION' 
const LOGGED_IN_USER_DEVICE_ID = 'LOGGED_IN_USER_DEVICE_ID' 
const LOGIN_PHONE = "LOGIN_PHONE"
const INITIALIZATION_STATE = "INITIALIZATION_STATE"
const LOGIN_MOBILE_CONFIRMATION_FUNCTION = "LOGIN_MOBILE_CONFIRMATION_FUNCTION"
const AUTHENTICATION_CHECK_STATE = "AUTHENTICATION_CHECK_STATE"
const INITIAL_DB_BACKUP_TAKEN = "INITIAL_DB_BACKUP_TAKEN"
const USER_DATA_DIRECTORY = "USER_DATA_DIRECTORY"
const USER_LANGUAGE = "LANGUAGE"
const INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE = "INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE"
const FCM_TOKEN_AND_FLAG = "FCM_TOKEN_AND_FLAG"
const FCM_TOKEN_FLAG = "FCM_TOKEN_FLAG"

const setDBInitialization = (newState) => ({
  type: DB_INITIALIZED,
  payload: {
    dbInitialized: newState
  }
})

const setInitialMasterDataSyncTimeSentState = (newState) => ({
  type: INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE,
  payload: {
    initialMasterDataSyncTimeSentState: newState
  }
})

const setLoggedInUserInformation = (userTypeId, userId, userDeviceId) => ({
  type: LOGGED_IN_USER_INFORMATION,
  payload: {
    userTypeId: userTypeId,
    userId: userId,
    userDeviceId: userDeviceId
  }
})

const setLoggedInUserDeviceId = (userDeviceId) => ({
  type: LOGGED_IN_USER_DEVICE_ID,
  payload: {
    userDeviceId: userDeviceId
  }
})

const setUserDataDirectory = (userDataDirectory) => ({
  type: USER_DATA_DIRECTORY,
  payload: {
    userDataDirectory: userDataDirectory
  }
})

const setUserLanguage = (userLanguage) => ({
  type: USER_LANGUAGE,
  payload: {
    userLanguage: userLanguage
  }
})

const setLoginPhone = (newState) => ({
  type: LOGIN_PHONE,
  payload: {
    loginPhone: newState
  }
})

const setInitializationState = (newState) => ({
  type: INITIALIZATION_STATE,
  payload: {
    initializationState: newState
  }
})

const setLoginMobileConfirmationFunction = (newState) => ({
  type: LOGIN_MOBILE_CONFIRMATION_FUNCTION,
  payload: {
    loginMobileConfirmationFunction: newState
  }
})

const setAuthenticationCheckState = (newState) => ({
  type: AUTHENTICATION_CHECK_STATE,
  payload: {
    authenticationCheckState: newState
  }
})

const setInitialDBBackupState = (newState) => ({
  type: INITIAL_DB_BACKUP_TAKEN,
  payload: {
    initialDBBackupTaken: newState
  }
})

const setFCMTokenInformation = (fcmToken, fcmTokenSentFlag) => ({
  type: FCM_TOKEN_AND_FLAG,
  payload: {
    fcmToken: fcmToken,
    fcmTokenSentFlag: fcmTokenSentFlag,
  }
})

const setFCMTokenFlag = (fcmTokenSentFlag) => ({
  type: FCM_TOKEN_FLAG,
  payload: {
    fcmTokenSentFlag: fcmTokenSentFlag,
  }
})


module.exports = { DB_INITIALIZED, 
                  INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE,
                  LOGGED_IN_USER_INFORMATION, LOGGED_IN_USER_DEVICE_ID, USER_DATA_DIRECTORY, USER_LANGUAGE,
                  LOGIN_PHONE, INITIALIZATION_STATE, LOGIN_MOBILE_CONFIRMATION_FUNCTION, AUTHENTICATION_CHECK_STATE,
                  INITIAL_DB_BACKUP_TAKEN, FCM_TOKEN_AND_FLAG, FCM_TOKEN_FLAG,
                    setDBInitialization,
                    setInitialMasterDataSyncTimeSentState,
                    setLoggedInUserInformation, setLoggedInUserDeviceId, setUserDataDirectory, setUserLanguage,
                    setLoginPhone, setInitializationState, setLoginMobileConfirmationFunction, setAuthenticationCheckState,
                    setInitialDBBackupState, setFCMTokenInformation, setFCMTokenFlag }