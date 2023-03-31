import { DB_INITIALIZED,
          INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE,
          LOGGED_IN_USER_INFORMATION, LOGGED_IN_USER_DEVICE_ID, USER_DATA_DIRECTORY, USER_LANGUAGE,
          LOGIN_PHONE, INITIALIZATION_STATE, LOGIN_MOBILE_CONFIRMATION_FUNCTION, AUTHENTICATION_CHECK_STATE,
          INITIAL_DB_BACKUP_TAKEN, FCM_TOKEN_AND_FLAG, FCM_TOKEN_FLAG } from '../actions/appStateOnPhone'

const persistentInitializationState = {
  dbInitialized: false,
  userDeviceId: -1,
  lastLoggedUserUserTypeId: -1,
  lastLoggedInUserId: '',
  userDataDirectory: '',
  userLanguage: 'en',
  initialMasterDataSyncTimeSentState: false,
  fcmToken: '',
  fcmTokenSentFlag: true
}

const nonPersistentInitializationState = {
  loginPhone: '',
  initializationState: 1,
  loginMobileConfirmationFunction: null,
  authenticationCheckState: 1,
  initialDBBackupTaken: false
}

const PersistentInitializationStateReducer = (state = persistentInitializationState, action) => {
  switch (action.type) {
    case DB_INITIALIZED: {
      const { dbInitialized } = action.payload
      return {
        ...state,
        dbInitialized: dbInitialized
      }
    }
    case INITIAL_MASTER_DATA_SYNC_TIME_SENT_STATE: {
      const { initialMasterDataSyncTimeSentState } = action.payload
      return {
        ...state,
        initialMasterDataSyncTimeSentState: initialMasterDataSyncTimeSentState
      }
    }
    case LOGGED_IN_USER_INFORMATION: {
      const { userTypeId, userId, userDeviceId } = action.payload
      return {
        ...state,
        userDeviceId: userDeviceId,
        lastLoggedInUserId: userId,
        lastLoggedUserUserTypeId: userTypeId
      }
    }
    case LOGGED_IN_USER_DEVICE_ID: {
      const { userDeviceId } = action.payload
      return {
        ...state,
        userDeviceId: userDeviceId,
      }
    }
    case USER_DATA_DIRECTORY: {
      const { userDataDirectory } = action.payload
      return {
        ...state,
        userDataDirectory: userDataDirectory,
      }
    }
    case USER_LANGUAGE: {
      const { userLanguage } = action.payload
      return {
        ...state,
        userLanguage: userLanguage,
      }
    }
    case FCM_TOKEN_AND_FLAG: {
      const { fcmToken, fcmTokenSentFlag } = action.payload
      return {
        ...state,
        fcmToken: fcmToken,
        fcmTokenSentFlag: fcmTokenSentFlag,
      }
    }
    case FCM_TOKEN_FLAG: {
      const { fcmTokenSentFlag } = action.payload
      return {
        ...state,
        fcmTokenSentFlag: fcmTokenSentFlag,
      }
    }
    default:
      return state;
  }
}

const NonPersistentInitializationStateReducer = (state = nonPersistentInitializationState, action) => {
  switch (action.type) {
    case LOGIN_PHONE: {
      const { loginPhone } = action.payload
      return {
        ...state,
        loginPhone: loginPhone
      }
    }
    case INITIALIZATION_STATE: {
      const { initializationState } = action.payload
      return {
        ...state,
        initializationState: initializationState
      }
    }
    case LOGIN_MOBILE_CONFIRMATION_FUNCTION: {
      const { loginMobileConfirmationFunction } = action.payload
      return {
        ...state,
        loginMobileConfirmationFunction: loginMobileConfirmationFunction
      }
    }
    case AUTHENTICATION_CHECK_STATE: {
      const { authenticationCheckState } = action.payload
      return {
        ...state,
        authenticationCheckState: authenticationCheckState
      }
    }
    case INITIAL_DB_BACKUP_TAKEN: {
      const { initialDBBackupTaken } = action.payload
      return {
        ...state,
        initialDBBackupTaken: initialDBBackupTaken
      }
    }
    default:
      return state;
  }
}

// export default DBInitializationReducer
module.exports = { PersistentInitializationStateReducer, NonPersistentInitializationStateReducer }