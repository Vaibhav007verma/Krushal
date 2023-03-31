import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  // TextInput,
  Button,
  useColorScheme,
  View,
  TouchableOpacity
} from 'react-native'
import { HelperText, TextInput, Snackbar } from 'react-native-paper';
import { validate } from 'uuid'
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { DatePickerModal } from 'react-native-paper-dates';
import DropDownPicker from 'react-native-dropdown-picker'
const moment = require('moment')


import { loadConfiguration } from '@krushal-it/common-core';
const lodashArray = require('lodash/array')
// import "react-datepicker/dist/react-datepicker.css";

const { extractBasedOnLanguage, assignL10NObjectToState, assignValueToL10NObject, extractLabelOrPlaceHolderTextAsPerLanguage } = require('@krushal-it/common-core')


const { commonRegexes, generateErrorMessage } = require('../common/validation')

const { basicStyles } = require('../common/style')
const styles = StyleSheet.create({
  ...basicStyles,
  phoneNumber: {
    fontSize: 21,
    marginTop: 20,
  },
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320,
    height: 260,
    display: 'flex',
  },
})

const setValueIntoStateForElement = (elementName, formDefinition, formState, setFormState, newValue) => {
  const newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }
  newFormElementState.displayValue = newValue

  if (formDefinition.formControls[elementName].type === 'text-l10n') {
    assignValueToL10NObject(newFormElementState.value, newValue, formDefinition.userLanguage)
  }

  newFormState[elementName] = newFormElementState
  setFormState(newFormState)
  return newFormState
}









const validateFormElements = (formDefinition, formState, setFormState) => {
  let currentFormState = { ...formState }
  let validationFailed = false
  for (const elementName of formDefinition.visibleFormControls) {
    const [returnedFormState, elementValidationFailed] = validateValueForElement(elementName, formDefinition, currentFormState, setFormState, undefined)
    currentFormState = returnedFormState
    if (elementValidationFailed) {
      validationFailed = true
    }
  }
  if (validationFailed) {
    if (currentFormState.formSnackbar) {
      currentFormState.formSnackbar.visible = 1
    }
    setFormState(currentFormState)
  }
  return [currentFormState, validationFailed]
}

const validateValueForElement = (elementName, formDefinition, formState, setFormState, event) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementValidations = elementDefinition.validations && Array.isArray(elementDefinition.validations) ? elementDefinition.validations : []
  const elementState = formState[elementName]
  let modifiedState = false
  const newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }
  let someCheckDone = false
  let someMatchFailed = false
  // console.log('KOCF vVFE 1, elementName = ', elementName)
  if (['positive-decimal'].includes(elementDefinition.type) && elementValidations.length === 0) {
    elementValidations.push({ type: 'regex', regexArray: ['AnyDecimal'] })
  }
  if (['positive-number'].includes(elementDefinition.type) && elementValidations.length === 0) {
    elementValidations.push({ type: 'regex', regexArray: ['AnyNumber'] })
  }
  if (elementValidations && elementValidations.length > 0) {
    someCheckDone = true

    for (const validationRegexReference of elementValidations) {
      // console.log('KOCF vVFE 3, validationRegexReference = ', validationRegexReference)
      if (validationRegexReference.type === 'Mandatory') {
        if (['text', 'positive-decimal', 'positive-number', 'text-numeric'].includes(elementDefinition.type)) {
          if (elementState.displayValue && elementState.displayValue.length > 0) {
            modifiedState = true
            newFormElementState.showError = 1
            newFormState[elementName] = newFormElementState
          } else {
            someMatchFailed = true
            modifiedState = true
            newFormElementState.showError = -1
            newFormState[elementName] = newFormElementState
          }
        } else if (['single-select', 'single-select-l10n', 'multi-select', 'multi-select-l10n'].includes(elementDefinition.type)) {
          if (elementState.value === undefined) {
            someMatchFailed = true
            modifiedState = true
            newFormElementState.showError = -1
            newFormState[elementName] = newFormElementState
          } else if (newFormElementState.showError === -1 && elementState.value !== undefined) {
            modifiedState = true
            newFormElementState.showError = 1
            newFormState[elementName] = newFormElementState
          }
        } else if (['text-l10n'].includes(elementDefinition.type)) {
          let elementKeysExist = true
          if (elementState.value === undefined) {
            elementKeysExist = false
          } else if (typeof elementState.value !== 'object') {
            elementKeysExist = false
          } else if (Object.keys(elementState.value).length === 0) {
            elementKeysExist = false
          } else {
            const l10nObjectKeys = Object.keys(elementState.value)
            const numberOfKeys = l10nObjectKeys.length
            if (l10nObjectKeys.includes('ul') && elementState.value['ul'].length === 0) {
              elementKeysExist = false
            }
          }
          if (!elementKeysExist) {
            someMatchFailed = true
            modifiedState = true
            newFormElementState.showError = -1
            newFormState[elementName] = newFormElementState
          } else if (elementKeysExist && newFormElementState.showError === -1) {
            modifiedState = true
            newFormElementState.showError = 1
            newFormState[elementName] = newFormElementState
          }
        } else if (['date'].includes(elementDefinition.type)) {
          if (elementState.value === undefined) {
            someMatchFailed = true
            modifiedState = true
            newFormElementState.showError = -1
            newFormState[elementName] = newFormElementState
          } else if (newFormElementState.showError === -1 && elementState.value !== undefined) {
            modifiedState = true
            newFormElementState.showError = 1
            newFormState[elementName] = newFormElementState
          }
        }
      } else {
        if (!someMatchFailed && validationRegexReference.type === 'regex') {
          const regexArray = validationRegexReference.regexArray
          for (const regexStringReference of regexArray) {
            const regexString = commonRegexes[regexStringReference]
            const regex = new RegExp(regexString)
            const regexMatched = regex.test((elementState.displayValue) ? elementState.displayValue : '')
            if (!regexMatched) {
              someMatchFailed = true
              modifiedState = true
              newFormElementState.showError = -1
              const elementLevelErrorMessage = generateErrorMessage(validationRegexReference, elementState.displayValue)
              if (elementLevelErrorMessage === '') {
                delete newFormElementState.errorMessage
              } else {
                newFormElementState.errorMessage = elementLevelErrorMessage
              }
              // console.log('KOCF vVFE 10')
              newFormState[elementName] = newFormElementState
            } else {
              if (newFormElementState.showError === -1) {
                modifiedState = true
                newFormElementState.showError = 1
                newFormState[elementName] = newFormElementState
              }
            }
          }
        }
      }
      // console.log('KOCF vVFE 6, return value = ', regexMatched)
    }
    if (!someMatchFailed) {
      let newValue
      if (['positive-decimal'].includes(elementDefinition.type)) {
        newValue = parseFloat(newFormElementState.displayValue)
        if (isNaN(newValue)) {
          newValue = null
        }
      } else if (['positive-number'].includes(elementDefinition.type)) {
        newValue = parseInt(newFormElementState.displayValue)
        if (isNaN(newValue)) {
          newValue = null
        }
      } else if (['date', 'single-select', 'single-select-l10n', 'multi-select', 'multi-select-l10n'].includes(elementDefinition.type)) {
        // don't do anything for date as we don't use displayvalue but directly use value
        newValue = newFormElementState.value
      } else if (['text-l10n'].includes(elementDefinition.type)) {
        // don't do anything for date as we don't use displayvalue but directly use value
        // assignL10NObjectToState(data[dataToElementFieldName], newFormElementState, formDefinition.userLanguage)
        newValue = newFormElementState.value
      } else {
        // for others assign display value to newValue
        newValue = newFormElementState.displayValue
      }
      if (newValue !== newFormElementState.value) {
        modifiedState = true
        newFormElementState.value = newValue
        newFormState[elementName] = newFormElementState
      }
    }
  }

  // below is to enforce display value to be value when there are no validations, but only if there are changes
  if (!someCheckDone && newFormElementState.value !== newFormElementState.displayValue
    && ['text', 'positive-decimal', 'positive-number', 'text-numeric'].includes(elementDefinition.type)) {
    someCheckDone = true
    modifiedState = true
    newFormElementState.value = newFormElementState.displayValue
    newFormState[elementName] = newFormElementState
  }

  if (!someCheckDone && newFormElementState.value !== newFormElementState.dbValue
    && ['date'].includes(elementDefinition.type)) {
    someCheckDone = true
    modifiedState = true
    newFormState[elementName] = newFormElementState
  }

  // if state is modified, do decide whether to re-render form or not
  if (modifiedState) {
    setFormState(newFormState)
    return [newFormState, someMatchFailed]
  } else {
    return [formState, someMatchFailed]
  }
}


const extractChangedValues = (formDefinition, formState, enforcedValues) => {
  const consolidatedValues = {}
  for (const elementName of formDefinition.visibleFormControls) {
    const formElement = formState[elementName]
    const elementDefinition = formDefinition.formControls[elementName]
    if (['single-select', 'multi-select', 'single-select-l10n', 'multi-select-l10n'].includes(elementDefinition.type)) {
      if (formElement.value === undefined && formElement.dbValue !== formElement.value) {
        formElement.value = null
      }
    } else {
    }
    // console.log('KOCF eCV 1, elementName = ', elementName, ', formElement.dbValue = ', formElement.dbValue, ', formElement.value = ', formElement.value)
    if ((enforcedValues && enforcedValues.includes(elementName)) || (formElement.dbValue !== formElement.value)) {
      if (formDefinition.elementToDataMapping && formDefinition.elementToDataMapping[elementName]) {
        const elementMappingDataFieldName = formDefinition.elementToDataMapping[elementName]
        consolidatedValues[elementMappingDataFieldName] = formElement.value
      } else {
        consolidatedValues[elementName] = formElement.value
      }
    }
  }
  return consolidatedValues
}














const assignDataToFormState = (formDefinition, data, formState, setFormState) => {
  const newFormState = { ...formState }
  let valueChanged = false
  for (const elementName of formDefinition.visibleFormControls) {
    let dataToElementFieldName = elementName
    const elementDefinition = formDefinition.formControls[elementName]
    if (formDefinition.elementToDataMapping && formDefinition.elementToDataMapping[elementName]) {
      dataToElementFieldName = formDefinition.elementToDataMapping[elementName]
    }
    const dataToElementFieldNameForList = dataToElementFieldName + '_list'
    const selectionListFromServer = data[dataToElementFieldNameForList]
    const selectionListInConfiguration = elementDefinition[dataToElementFieldNameForList]
    const finalListData = (selectionListInConfiguration) ? selectionListInConfiguration : selectionListFromServer
    if (['single-select', 'single-select-l10n', 'multi-select', 'multi-select-l10n'].includes(elementDefinition.type)) {
      const doesListDataExist = (selectionListInConfiguration) ? selectionListInConfiguration : selectionListFromServer
      if (!data[dataToElementFieldName] && !finalListData) {
        continue
      }
    } else {
      if (!data[dataToElementFieldName]) {
        continue
      }
    }
    valueChanged = true
    const newFormElementState = { ...newFormState[elementName] }
    if (['single-select', 'single-select-l10n', 'multi-select', 'multi-select-l10n'].includes(elementDefinition.type)) {
      // newFormElementState.value = 1201 // 1 // data[dataToElementFieldName]
      // newFormElementState.dbValue = 1201 // 1 // data[dataToElementFieldName]
      // newFormElementState.displayValue = 1201 // 1 // data[dataToElementFieldName]
      newFormElementState.value = data[dataToElementFieldName]
      newFormElementState.dbValue = data[dataToElementFieldName]
      newFormElementState.displayValue = data[dataToElementFieldName]
      // newFormElementState.list = [{"district_name": "Ahmednagar", "ref_district_id": 1201}, {"district_name": "Solapur", "ref_district_id": 1202}]// data[dataToElementFieldNameForList]

      if (['single-select', 'multi-select'].includes(elementDefinition.type)) {
        newFormElementState.list = data[dataToElementFieldNameForList]
      } else {
        if (elementDefinition.list) {
        } else {
          const l10nObjectKey = elementDefinition['labelKeyInList']
          const listRecordsWithLanguage = data[dataToElementFieldNameForList]
          for (const listRecordWithLanguage of listRecordsWithLanguage) {
            const l10nObject = listRecordWithLanguage[l10nObjectKey]
            const languageSpecificLabel = extractBasedOnLanguage(l10nObject, formDefinition.userLanguage)
            listRecordWithLanguage[l10nObjectKey] = languageSpecificLabel
          }
          newFormElementState.list = listRecordsWithLanguage
        }
      }
    } else if (['text-l10n'].includes(elementDefinition.type)) {
      assignL10NObjectToState(data[dataToElementFieldName], newFormElementState, formDefinition.userLanguage)
    } else {
      newFormElementState.value = data[dataToElementFieldName]
      newFormElementState.displayValue = String(newFormElementState.value)
      newFormElementState.dbValue = data[dataToElementFieldName]
    }
    newFormState[elementName] = newFormElementState
  }
  if (valueChanged) {
    setFormState(newFormState)
    return newFormState
  } else {
    return formState
  }
}

const setDatePickerVisibility = (elementName, formDefinition, formState, setFormState, visibility) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementState = formState[elementName]

  const newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }

  newFormElementState.dataPickerVisible = visibility
  newFormState[elementName] = newFormElementState

  setFormState(newFormState)
  return newFormState
}

const setDateForElement = async (elementName, formDefinition, formState, setFormState, date) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementState = formState[elementName]

  const newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }

  newFormElementState.value = date
  // newFormElementState.displayValue = String(date)
  newFormState[elementName] = newFormElementState

  setFormState(newFormState)
  return newFormState
}

const dismissSnackbar = (formDefinition, formState, setFormState) => {
  if (formState.formSnackbar) {
    const newFormState = { ...formState }
    const newFormElementState = { ...formState['formSnackbar'] }
    newFormElementState.visible = -1
    newFormState['formSnackbar'] = newFormElementState
    setFormState(newFormState)
  }
}

const setDropdownOpenStatus = (elementName, formDefinition, formState, setFormState, visibility) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementState = formState[elementName]

  let newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }

  newFormElementState.dropdownOpen = visibility
  newFormState[elementName] = newFormElementState

  if (!visibility) {
    // const vVFEReturnValue = validateValueForElement(elementName, formDefinition, newFormState, setFormState)
    // const returnedFormState = vVFEReturnValue.returnedFormState
    // const elementValidationFailed = vVFEReturnValue.validationFailed
    const [returnedFormState, elementValidationFailed] = validateValueForElement(elementName, formDefinition, newFormState, setFormState)
    newFormState = returnedFormState
  }

  setFormState(newFormState)
  return newFormState
}

const setDropdownValue = (userDeviceId, elementName, formDefinition, formState, setFormState, value) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementState = formState[elementName]

  let valueChanged = false

  let newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }

  if (formState[elementName].value !== value) {
    valueChanged = true
    newFormElementState.value = value
    newFormElementState.displayValue = value
    newFormElementState.dropdownOpen = false
    newFormState[elementName] = newFormElementState

    /*
    if (elementDefinition['onSetValue']) {
      const setValueCallbackFunction = elementDefinition['onSetValue']
      newFormState = await setValueCallbackFunction(userDeviceId, formDefinition.userLanguage, newFormState, setFormState, value)
    }
    */
  } else {
    newFormElementState.dropdownOpen = false
    newFormState[elementName] = newFormElementState
  }
  return [valueChanged, newFormState]
  /*
  let returnedFormState
  let elementValidationFailed
  if (formDefinition.autoSave && formDefinition.autoSave === 1) {
    const autoSaveCallbackFunction = formDefinition.autoSaveCallback
    // await autoSaveCallbackFunction(newFormState)
  } else {
    const vVFEReturnValue = validateValueForElement(elementName, formDefinition, newFormState, setFormState)
    returnedFormState = vVFEReturnValue.returnedFormState
    elementValidationFailed = vVFEReturnValue.validationFailed
    setFormState(returnedFormState)
    return returnedFormState
  }
  */
}

const handleDropdownSetValue = async (userDeviceId, elementName, formDefinition, formState, setFormState, valueCallbackFunction) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const newValue = valueCallbackFunction()
  let valueChanged = false
  let newFormState
  [valueChanged, newFormState] = setDropdownValue(userDeviceId, elementName, formDefinition, formState, setFormState, newValue)
  if (valueChanged) {
    if (elementDefinition['onSetValue']) {
      const setValueCallbackFunction = elementDefinition['onSetValue']
      newFormState = await setValueCallbackFunction(userDeviceId, formDefinition.userLanguage, newFormState, setFormState, newValue)
    }


    if (formDefinition.autoSave && formDefinition.autoSave === 1) {
      const autoSaveCallbackFunction = formDefinition.autoSaveCallback
      await autoSaveCallbackFunction(newFormState)
    } else {
      // const vVFEReturnValue = validateValueForElement(elementName, formDefinition, newFormState, setFormState)
      // returnedFormState = vVFEReturnValue.returnedFormState
      // elementValidationFailed = vVFEReturnValue.validationFailed
      [returnedFormState, elementValidationFailed] = validateValueForElement(elementName, formDefinition, newFormState, setFormState)
      setFormState(returnedFormState)
      return returnedFormState
    }
  }
}

const clearDropdown = (elementName, formDefinition, formState, setFormState) => {
  const elementDefinition = formDefinition.formControls[elementName]
  const elementState = formState[elementName]

  let newFormState = { ...formState }
  const newFormElementState = { ...formState[elementName] }

  newFormElementState.value = undefined
  newFormState[elementName] = newFormElementState

  setFormState(newFormState)
  return newFormState
}



















































const KrushalOCForm = (props) => {
  const formState = props.formState
  const setFormState = props.setFormState
  const formDefinition = props.formDefinition
  const userDeviceId = props.userDeviceId
  const numberOfControls = formDefinition.visibleFormControls.length
  console.log(formState)
  return (
    <ScrollView>
      {
        formDefinition.visibleFormControls.map((elementName, index) => {
          const elementDefinition = formDefinition.formControls[elementName]
          const elementState = formState[elementName]
          const isMandatory = (elementDefinition.validations && Array.isArray(elementDefinition.validations) && (lodashArray.findIndex(
            elementDefinition.validations,
            validation => {
              return validation.type === 'Mandatory'
            }) >= 0))

          // console.log('KOC c 1, elementName = ', elementName, ', elementState = ', elementState, ', isMandatory = ', isMandatory)
          const elementLabel = extractLabelOrPlaceHolderTextAsPerLanguage(elementDefinition.label, isMandatory, formDefinition.userLanguage)
          let elementPlaceHolderText = extractLabelOrPlaceHolderTextAsPerLanguage(elementDefinition.placeHolderText, isMandatory, formDefinition.userLanguage)
          console.log("---------------------------------------------",elementLabel)
          if (elementState.readOnly && formState.displayValue === '') {
            elementPlaceHolderText = ''
          }

          // const isMandatory = (elementDefinition.validations && Array.isArray(elementDefinition.validations) && elementDefinition.validations.includes('Mandatory'))
          switch (elementDefinition.type) {
            case 'positive-decimal':
            case 'positive-number':
            case 'text-l10n':
            case 'text-numeric':
            case 'text': {
              const textInputStyle = { ...styles.paper.input }
              let fontSize = styles.input.placeHolderFontSize
              // console.log('KOCF c 2, elementState.displayValue = ', elementState.displayValue)
              if (elementState.displayValue && elementState.displayValue.length > 0) {
                fontSize = styles.input.fontSize
              }
              textInputStyle.fontSize = fontSize
              /*
                <Text style={styles.label}>{elementLabel}</Text>
              */
              /*
              helper text
              */
              return (
                <View key={"element" + index}>
                  <View style={{
                    backgroundColor: 'white',
                    // flex: 1, justifyContent: 'center',
                    // alignItems: 'flex-start',
                    width: "100%"
                  }} >
                    {/* <Text style={styles2.textLabel2} >{elementLabel}</Text> */}
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginLeft: 15,
                      color: 'black'
                    }} >{elementLabel}</Text>
                    <TextInput
                      // label={elementLabel}
                      keyboardType={elementDefinition.type === 'text-numeric' ? 'number-pad' : ''}
                      mode='outlined'
                      dense={true}
                      error={(elementState.showError && elementState.showError === -1)}
                      // style={styles2.textInputStyle2}
                      style={{
                        width: "90%",
                        justifyContent: 'center',
                        fontSize: 18,
                        alignItems: 'flex-start',
                        placeHolderFontSize: 10,
                        // placeHolderFontWeight: 'bold' ,
                        padding: 5,
                        color: '#000000',
                        textColor: '#000000',
                        alignSelf: 'center',
                        backgroundColor: 'white',
                        // borderWidth: 2,
                        borderRadius: 15,
                        // marginLeft: 1
                      }}
                      placeholder={elementPlaceHolderText}
                      // </View>placeholder={placeholderToUse}
                      value={elementState.displayValue}
                      onChangeText={(newValue) => {
                        const returnedFormState = setValueIntoStateForElement(elementName, formDefinition, formState, setFormState, newValue)
                        if (formState[elementName].showError && formState[elementName].showError === -1) {
                          validateValueForElement(elementName, formDefinition, returnedFormState, setFormState)
                        }
                      }}
                      onBlur={async (event) => {
                        if (formDefinition.autoSave && formDefinition.autoSave === 1) {
                          const autoSaveCallbackFunction = formDefinition.autoSaveCallback
                          await autoSaveCallbackFunction(formState)
                        } else {
                          validateValueForElement(elementName, formDefinition, formState, setFormState, event)
                        }
                      }}
                    >
                    </TextInput>
                    <HelperText
                      style={{ color: 'red', fontSize: 13.2 }}
                      type="error" visible={(elementState.showError === -1)}>
                      {(elementState.errorMessage && elementState.errorMessage.length > 0) ? elementState.errorMessage : (elementDefinition.errorMessage && elementDefinition.errorMessage.length > 0) ? elementDefinition.errorMessage : ''}
                    </HelperText>
                  </View>
                </View >
              )
            }
            case 'date': {
              const isDateControlVisible = (elementState.dataPickerVisible && elementState.dataPickerVisible === 1) ? true : false

              const textInputStyle = { ...styles.paper.input }
              let fontSize = styles.input.placeHolderFontSize
              if (dateDisplay && dateDisplay.length > 0) {
                fontSize = styles.input.fontSize
              }
              textInputStyle.fontSize = fontSize

              let minimumDate
              let maximumDate

              if (elementDefinition.validations && Array.isArray(elementDefinition.validations)) {
                const minimumDateValidationIndex = lodashArray.findIndex(
                  elementDefinition.validations,
                  validation => {
                    return validation.type === 'MinimumDate'
                  })
                if (minimumDateValidationIndex >= 0) {
                  minimumDate = elementDefinition.validations[minimumDateValidationIndex].value
                }
                const maximumDateValidationIndex = lodashArray.findIndex(
                  elementDefinition.validations,
                  validation => {
                    return validation.type === 'MaximumDate'
                  })
                if (maximumDateValidationIndex >= 0) {
                  maximumDate = elementDefinition.validations[maximumDateValidationIndex].value
                }
              }

              let dateDefaultValue
              let currentDate = new Date()
              if (minimumDate && minimumDate > currentDate) {
                dateDefaultValue = minimumDate
              }
              if (maximumDate && maximumDate < currentDate) {
                dateDefaultValue = maximumDate
              }

              const dateObject = (elementState.value && (elementState.value !== '' && elementState.value !== null)) ? new Date(elementState.value) : dateDefaultValue
              const dateDisplay = (elementState.value && (elementState.value !== '' && elementState.value !== null)) ? moment(elementState.value).format('MM/DD/YYYY') : undefined

              return (
                <View key={"element" + index}>
                  <View style={{
                    backgroundColor: 'white',
                    // flex: 1, justifyContent: 'center',
                    // alignItems: 'flex-start',
                    width: "100%"
                  }} >

                    {/* <Text style={styles2.textLabel2} >{elementLabel}</Text> */}
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginLeft: 15,
                      color: 'black'
                    }} >{elementLabel}</Text>
                    <TouchableOpacity onPress={async () => {
                      setDatePickerVisibility(elementName, formDefinition, formState, setFormState, 1)
                    }}>
                      {/*<Text style={styles.label}>{elementLabel}</Text>
                    <Text style={styles.label}>{dateDisplay}</Text>*/}
                      <TextInput
                        // label={elementLabel}
                        mode='outlined'
                        disabled={true}
                        dense={true}
                        error={(elementState.showError && elementState.showError === -1)}
                        // style={styles2.textInputStyle2}
                        style={{
                          width: "90%",
                          justifyContent: 'center',
                          fontSize: 18,
                          alignItems: 'flex-start',
                          placeHolderFontSize: 10,
                          // placeHolderFontWeight: 'bold' ,
                          padding: 5,
                          color: '#000000',
                          textColor: '#000000',
                          alignSelf: 'center',
                          backgroundColor: 'white',
                          // borderWidth: 2,
                          borderRadius: 15,
                          // marginLeft: 1
                        }}
                        placeholder={elementPlaceHolderText}
                        // </View>placeholder={placeholderToUse}
                        value={dateDisplay}
                        right={< TextInput.Icon icon="calendar" onPress={async () => {
                          setDatePickerVisibility(elementName, formDefinition, formState, setFormState, 1)
                        }} />}
                      >
                      </TextInput>
                    </TouchableOpacity>
                    {/*<DatePickerModal
                    mode="single"
                    visible={isDateControlVisible}
                    onDismiss={(params) => {
                      setDatePickerVisibility(elementName, formDefinition, formState, setFormState, -1)
                    }}
                      const returnedFormState = setDateForElement(elementName, formDefinition, formState, setFormState, params.date)
                  */}
                    <DateTimePickerModal
                      locale="en"
                      mode="date"
                      isVisible={isDateControlVisible}
                      label={elementLabel}
                      date={dateObject}
                      minimumDate={minimumDate}
                      maximumDate={maximumDate}
                      onConfirm={async (params) => {
                        let returnedFormState = setDateForElement(elementName, formDefinition, formState, setFormState, params)
                        returnedFormState = setDatePickerVisibility(elementName, formDefinition, returnedFormState, setFormState, -1)
                        if (formDefinition.autoSave && formDefinition.autoSave === 1) {
                          const autoSaveCallbackFunction = formDefinition.autoSaveCallback
                          await autoSaveCallbackFunction(returnedFormState)
                        } else {
                          validateValueForElement(elementName, formDefinition, returnedFormState, setFormState, undefined)
                        }
                      }}
                      onCancel={(params) => {
                        const [returnedFormState, elementValidationFailed] = validateValueForElement(elementName, formDefinition, formState, setFormState, undefined)
                        setDatePickerVisibility(elementName, formDefinition, returnedFormState, setFormState, -1)
                      }}
                    />
                    <HelperText type="error" visible={(elementState.showError === -1)}>
                      {(elementState.errorMessage && elementState.errorMessage.length > 0) ? elementState.errorMessage : (elementDefinition.errorMessage && elementDefinition.errorMessage.length > 0) ? elementDefinition.errorMessage : ''}
                    </HelperText>

                  </View>
                </View>
              )
            }
            case 'multi-select-l10n':
            case 'single-select-l10n':
            case 'multi-select':
            case 'single-select': {
              const isDropdownMultiSelect = (elementDefinition.type === 'multi-select')
              /*
                <DropDownPicker
                  multiple={(elementDefinition.type === 'multi-select')}
                  schema={{label: elementDefinition['labelKeyInList'], value: elementDefinition['valueKeyInList']}}
                  placeholder={elementDefinition.placeHolderText ? elementDefinition.placeHolderText.concat(isMandatory ? "*" : "") : "" }
                  searchable={elementDefinition.searchable}
                  mode={(elementDefinition.type === 'multi-select') ? "BADGE" : "SIMPLE"}
             
                  open={elementState.dropdownOpen}
                  setOpen={(openStatus) => {
                    // console.log('KOCF c msss 1, openStatus = ', openStatus)
                    if (openStatus) {
                      setDropdownOpenStatus(elementName, formDefinition, formState, setFormState, openStatus)
                    }
                  }}
                  items={elementState.list}
                  // setItems={setItems}
                  value={elementState.value}
                  setValue={(valueCallbackFunction) => {
                    // console.log('KOCF c DDP 2, params = ', valueCallbackFunction)
                    const newValue = valueCallbackFunction()
                    setDropdownValue(elementName, formDefinition, formState, setFormState, newValue)
                  }}
                />
             
              */
              /*
                  open={false}
                  value={elementState.value}
                  items={elementState.list}
                  setOpen={(params) => {
                    console.log('KOCF c DDP 1, params = ', params)
                  }}
                  setValue={(params) => {
                    console.log('KOCF c DDP 2, params = ', params)
                  }}
                  setItems={(params) => {
                    console.log('KOCF c DDP 3, params = ', params)
                  }}
              */
              /*
                  open={open}
                  setOpen={setOpen}
             
                  items={items}
                  setItems={setItems}
             
                  value={value}
                  setValue={setValue}
              */
              return (
                <SafeAreaView>
                  {/* <ScrollView > */}
                  <View style={{
                    backgroundColor: 'white', 
                    width: "100%",
                    // marginBottom: 10,
                    // height: 75,
                  }} key={"element" + index}>

                    {/* <View  > */}
                    <Text style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginLeft: 15,
                      color: 'black',
                      marginBottom:5
                      // height: 80,
                    }} >{elementLabel}</Text>
                    {/* <Text style={styles.label}>{elementLabel}</Text> */}
                    <DropDownPicker
                      placeholder={elementPlaceHolderText}
                      placeholderStyle={{fontSize:15}}
                      listMode='SCROLLVIEW'
                      schema={{ label: elementDefinition['labelKeyInList'], value: elementDefinition['valueKeyInList'] }}
                      zIndex={(numberOfControls - index + 1) * 100}
                      // style={styles2.textInputStyle3}
                      style={{
                        width: "90%",
                        justifyContent: 'center',
                        fontSize: 25,
                        alignSelf: 'center',
                        alignItems: 'center',
                        placeHolderFontSize: 10,
                        padding: 5,
                        color: '#000000',
                        textColor: '#000000',
                        // backgroundColor:'red',
                        // backgroundColor: 'red',
                        // borderWidth: 2,
                        // borderRadius: 15,
                        // marginTop: 5,
                        borderRadius: 15,

                      }}
                      // itemStyle={{
                      //   backgroundColor: 'pink',
                      //   width:'80%',
                      //   height:300,
                      //   marginBottom:20

                        // height:350

                      // }}
                      dropDownContainerStyle={{
                        // backgroundColor: 'green',
                        width: "90%",
                        justifyContent: 'center',
                        alignSelf: 'center',
                       



                      }}
                      open={elementState.dropdownOpen}
                      setOpen={(openStatus) => {
                        // console.log('KOCF c msss 1, openStatus = ', openStatus)
                        if (openStatus) {
                          setDropdownOpenStatus(elementName, formDefinition, formState, setFormState, openStatus)
                        }
                      }}

                      items={(elementDefinition.list) ? elementDefinition.list : elementState.list}
                      // setItems={setItems}

                      value={elementState.value}
                      setValue={async (valueCallbackFunction) => {
                        await handleDropdownSetValue(userDeviceId, elementName, formDefinition, formState, setFormState, valueCallbackFunction)
                      }}
                      onPress={(openStatus) => {
                        if (!openStatus) {
                          setDropdownOpenStatus(elementName, formDefinition, formState, setFormState, openStatus)
                        }
                      }}
                    />
                    <HelperText type="error" visible={(elementState.showError === -1)}>
                      {(elementState.errorMessage && elementState.errorMessage.length > 0) ? elementState.errorMessage : (elementDefinition.errorMessage && elementDefinition.errorMessage.length > 0) ? elementDefinition.errorMessage : ''}
                    </HelperText>
                    {elementDefinition.clearable && elementDefinition.clearable === 1 ? (
                      <Text onPress={() => clearDropdown(elementName, formDefinition, formState, setFormState)}>{elementDefinition.clearPrompt}</Text>
                    ) : (<></>)}

                  </View>
                  {/* </View> */}
                  {/* </ScrollView> */}
                </SafeAreaView>
              )
            }
          }
        })
      }
      {/* 
        action={{
          label: 'Undo',
          onPress: () => {
            // Do something
          },
        }}>

      */}
      <Snackbar
        visible={formState.formSnackbar.visible === 1}
        onDismiss={() => dismissSnackbar(formDefinition, formState, setFormState)}
      >
        Some data is not valid
      </Snackbar>
    </ScrollView >
  )
}

module.exports = { KrushalOCForm, extractChangedValues, assignDataToFormState, validateFormElements }

const styles2 = StyleSheet.create({
  textInputStyle2: {
    width: "90%",
    justifyContent: 'center',
    fontSize: 25,
    alignItems: 'flex-start',
    placeHolderFontSize: 10,
    // placeHolderFontWeight: 'bold' ,
    padding: 5,
    color: '#000000',
    textColor: '#000000',
    alignSelf: 'center',
    backgroundColor: 'white',
    // borderWidth: 2,
    borderRadius: 15,

  },
  textInputStyle3: {
    width: "95%",
    justifyContent: 'center',
    fontSize: 25,
    placeHolderFontSize: 18,
    padding: 5,
    color: '#000000',
    textColor: '#000000',
    backgroundColor: 'white',
    // borderWidth: 2,
    // borderRadius: 15,
    marginTop: 5,
    alignSelf: 'center'

  },
  textLabel2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    color: 'black'
  }
})