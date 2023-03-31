const INITIALIZATION_SCREEN_STATES = {
  INITIAL_SCREEN: 1,
  DB_LOADING_MESSAGE_SCREEN: 2,
  ERROR_DB_NOT_LOADED_MESSAGE_SCREEN: 3,
  
  CHECK_INITIAL_MASTER_DATA_SYNC_TIME_SENT_TIME_SCREEN: 11,
  COLLATING_AND_SENDING_INITIAL_MASTER_DATA_SYNC_TIME_MESSAGE_SCREEN: 12,
  
  CHECK_PERMISSION_FOR_BACKUP_SCREEN: 21,
  CONFIGURED_TO_TAKE_BACKUP_TAKING_BACKUP_MESSAGE_SCREEN: 22,
  ERROR_IN_TAKING_BACKUP_MESSAGE_SCREEN: 23,
  CONFIGURED_TO_TAKE_BACKUP_BUT_NO_PERMISSION_TO_BACKUP_MESSAGE_SCREEN: 24,
  CHECK_USER_AUTHENTICATION_SCREEN: 41,
  
  CHOOSE_LANGUAGE_SCREEN: 51,

  PHONE_NUMBER_ENTRY_SCREEN: 61,
  MESSAGE_PHONE_NUMBER_BEING_CHECKED_IN_SYSTEM_SCREEN: 62,
  MESSAGE_PHONE_NUMBER_NOT_AVAILABLE_IN_SYSTEM_SCREEN: 63,
  MESSAGE_THAT_PHONE_NUMBER_FOR_VERIFICATION_IS_BEING_REGISTERED_WITH_FIREBASE_SCREEN: 64,
  AUTHENTICATION_PROBLEM_SCREEN: 65,
  OTP_ENTRY_SCREEN: 66,
  MESSAGE_VERIFYING_OTP_SCREEN: 67,
  MESSAGE_WRONG_OTP_SCREEN: 68,

  CHECK_FCM_FLOW_SCREEN: 71,
  CHECK_FCM_PERMISSION_SCREEN: 72,
  COMPARE_AND_SEND_FCM_TOKEN_SCREEN: 73,

  LOAD_REFERENCE_DATA_MESSAGE_SCREEN: 81,
  LOADING_REFERENCES_MESSAGE_SCREEN: 82,
  ERROR_IN_LOAD_REFERENCE_DATA_MESSAGE_SCREEN: 83,
  
  CHECK_PERMISSION_SCREEN: 92,
  INFORM_ABOUT_PERMISSION_SCREEN: 93,
  PERMISSION_DENIED_MESSAGE_SCREEN: 94,
  
  SYNCHRONIZATION_SCREEN_AS_DB_NOT_INITIALIZED_THROUGH_SYNC: 101,
  SYNCHRONIZATION_ERROR_SCREEN_WHEN_DB_NOT_INITIALIZED_THROUGH_SYNC: 102,
  SYNCHRONIZATION_SCREEN_ENABLE_PROCEED_TO_HOME_SCREEN_AS_DB_INITIALIZED: 103,
  
  HOME_SCREEN_POST_DB_INITIALIZATION_THROUGH_SYNC: 111
// 1 -> Splash screen loading
// 2 -> splash screen (database loading) - not used
// 3 -> splash screen with error message (database did not load for ever) - not used
// 3001 -> Configuration to take back up, Taking DB Backup
// 3002 -> Error in taking DB Backup
// 3003 -> Configuration to take backup, No permission to take backup, proceed
// 3004 -> Check Permission
// 3005 -> Check user authentication
// 5 -> Phone Number entry screen (not logged in)
// 6 -> Phone number is being checked on the backend
// 7 -> Phone number not available on the system
// 8 -> Getting Confirmation function from firebase for mobile number
// 9 -> Problem in authentication, need system admin help
// 10 -> OTP entry screen (not logged in, phone number entered, waiting for OTP to be confirmed)
// 11 -> Verifying OTP
// 12 -> Wrong OTP Screen (not logged in, phone number and OTP entered, wrong OTP)
// 13 -> Database Not initialized, sync screen
// 14 -> Database Not initialized, sync error, try again, exit
// 15 -> Database Initialized, proceed to Home Screen Button Enabled
// 16 -> Home Screen
}

module.exports = {INITIALIZATION_SCREEN_STATES}