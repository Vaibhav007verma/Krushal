/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Provider as PaperProvider } from 'react-native-paper'

/*import {
  en,
  registerTranslation,
} from 'react-native-paper-dates'*/

import {store, persistor} from './src/redux/store'

import type {Node} from 'react';

import { InitialScreen } from './src/screens/initial/InitialScreen'

// registerTranslation('en', en)

const App: (props) => Node = (props) => {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <PaperProvider>
          <InitialScreen/>

        </PaperProvider>
      </PersistGate>
    </Provider>
  )
}

export default App;
