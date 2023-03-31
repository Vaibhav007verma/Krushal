import {NativeModules} from 'react-native';
const { SleepModule } = NativeModules;

const sleepInMillis = async (milliSeconds) => {
  console.log('calling global function 1, SleepModule = ', SleepModule)
  SleepModule.sleepInMilliSeconds(milliSeconds)
  console.log('calling global function 2')
}


module.exports = { sleepInMillis }