const lodashArray = require('lodash/array')

const { createHeaders } = require('@krushal-it/common-core')
const { sleepInMillis } = require('../../globalFunctions')

const {
  dbConnections,
  initializeAllRepositories,
  regenerateUpdatedAtTriggers,
  getDBConnections
} = require('@krushal-it/ah-orm')

// const {
//   getDocumentById,
//   updateDocumentById,
//   createDocument,
//   getReferenceData,
//   uploadFile,
// } = require('../router/router')
const {
  getReferenceData,
  getReferenceData2
} = require('@krushal-it/ah-router')

global.references = []
global.loadingReferences = 0

const referenceConfiguration = [
  {reference_category_id: 10001400},
  {reference_category_id: 10001600},
  {reference_category_id: 10002600}
]
const {INITIALIZATION_SCREEN_STATES} = require('./constants')
import { setInitializationState } from '../redux/actions/appStateOnPhone';

const categoryIdArray = [10001400, 10001600, 10002600]

const loadReferences = async (dispatch, userDeviceId, userLanguage) => {
  try {
    let counter = 0
    while (global.loadingReferences === 1 && counter < 5) {
      counter++
      if (counter === 5) {
        global.loadingReferences = 0
        return -1
      }
      await sleepInMillis(1000)
    }
    if (global.loadingReferences === 2) {
      return 0
    }
    global.loadingReferences = 1
    const headers = createHeaders(userDeviceId, 'Get References')
    const postData = {category_id_array: categoryIdArray, language: userLanguage}
    const referenceResults = await getReferenceData2(headers, postData)
    global.references = referenceResults.data
    global.loadingReferences = 2
    return 1
  } catch (error) {
    console.log('r lR 9, error in loading references, error = ', error)
    throw error
  }
}

const populateReferences = async (userDeviceId, referenceCategoryReferenceTypes, setReferenceCategoryReferenceTypes, categoryId) => {
  if (Object.keys(references).length === 0) {
    const headers = createHeaders(userDeviceId, 'Get References')
    const referenceResults = await getReferenceData(headers, referenceConfiguration)
    references = referenceResults.data
  }
  if (referenceCategoryReferenceTypes.length === 0) {
    const referenceCategoryIdIndex = lodashArray.findIndex(
      references,
      referenceCategory => {
        return referenceCategory.reference_category_id == categoryId
      },
    )
    const referenceTypesFromServer = references[referenceCategoryIdIndex]
    setReferenceCategoryReferenceTypes(referenceTypesFromServer.list_data)
  }
}

const getReferenceForCategoryId = (categoryId) => {
  const referenceCategoryIdIndex = lodashArray.findIndex(
    global.references,
    referenceCategory => {
      return referenceCategory.reference_category_id == categoryId
    },
  )
  if (referenceCategoryIdIndex >= 0) {
    const referenceTypesFromServer = references[referenceCategoryIdIndex]
    return referenceTypesFromServer.list_data
  } else {
    throw new Error('No reference data available')
  }
}

const manageLoadReferenceDataFlow = async (dispatch, userDeviceId, userLanguage) => {
  try {
    await sleepInMillis(1000)
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.LOADING_REFERENCES_MESSAGE_SCREEN))
    let waitForLoadReferences = 0
    // while (!waitForLoadReferences) {
      waitForLoadReferences = await loadReferences(dispatch, userDeviceId, userLanguage)
      // await sleepInMillis(1000)
    // }
    if (waitForLoadReferences === -1) {
      dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.LOAD_REFERENCE_DATA_MESSAGE_SCREEN))
    } else {
      dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_PERMISSION_SCREEN))
    }
    // dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.CHECK_PERMISSION_SCREEN))
  } catch (error) {
    console.log('r mLRD 4, error = ', error)
    dispatch(setInitializationState(INITIALIZATION_SCREEN_STATES.ERROR_IN_LOAD_REFERENCE_DATA_MESSAGE_SCREEN))
  }
}


module.exports = {populateReferences, loadReferences, getReferenceForCategoryId, manageLoadReferenceDataFlow}