// import { combineReducers} from 'redux';
// import { legacy_createStore as createStore} from 'redux';

import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  persistStore
} from 'redux-persist';
// import storage from 'redux-persist/lib/storage'


import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { PersistentInitializationStateReducer, NonPersistentInitializationStateReducer } from './reducers/appStateOnPhoneReducer';
 
const persistConfig = {
  key: 'root',
  // storage,
  storage: AsyncStorage,
  blacklist: ['nonPersistentAppStateOnPhone']
}

const rootReducer = combineReducers({
  persistentAppStateOnPhone: PersistentInitializationStateReducer,
  nonPersistentAppStateOnPhone: NonPersistentInitializationStateReducer
})

const persistedRootReducer = persistReducer(persistConfig, rootReducer)
 
const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
          serializableCheck: {
              ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          },
      }),
});
const persistor = persistStore(store)
module.exports = {store, persistor}
