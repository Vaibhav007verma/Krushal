/**
 * @format
 */
import 'react-native-gesture-handler';
import Config from 'react-native-config'
const {
  loadConfiguration,
  configurationJSON,
} = require('@krushal-it/common-core')
console.log(process.env)
if (process.env && process.env.ENV_JSON) {
  loadConfiguration(process.env.ENV_JSON)
} else if (Config && Config.ENV_JSON) {
  console.log('Config.ENV_JSON = ', Config.ENV_JSON)
  loadConfiguration(Config.ENV_JSON)
}
console.log('configurationJSON = ', configurationJSON())
import {AppRegistry} from 'react-native'
import App from './App'
import {name as appName} from './app.json'
AppRegistry.registerComponent(appName, () => App)
