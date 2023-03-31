/* eslint-disable semi */
const { get, post, configurationJSON } = require('@krushal-it/common-core')
const { CustomerLib, CustomerListLib, AnimalListLib, AnimalLib, ReferencesLib, DocumentListLib, DocumentLib } = require('@krushal-it/back-end-lib')
import RNFetchBlob from 'rn-fetch-blob'

const checkIfPhoneNumberIsOfStaff = async (headers, phoneNumber) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      '/validate-phone?phoneNumber=' +
      phoneNumber
    console.log('r cPIOFS 1, url = ', url)
    const response = await get(url, headers)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const loginMobileUser = async (headers, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      '/login-mobile-user'
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

/*const listFarmers = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/customer-list'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const customerListLib = new CustomerListLib()
      const response = await customerListLib.create(data, {})
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const createFarmer = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/v2/customer'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const customerLib = new CustomerLib()
      const response = await customerLib.create(data, {})
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const getFarmerById = async (headers, id) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/customer/' +
        id
      const response = await get(url, headers)
      return response.data
    } else {
      const customerLib = new CustomerLib()
      const response = await customerLib.get(id, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const updateFarmerById = async (headers, id, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/customer/' +
        id
      const response = await patch(url, headers, data)
      return response.data
    } else {
      const customerLib = new CustomerLib()
      const response = await customerLib.patch(id, data, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const listAnimals = async (headers, data, customerId) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      let url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/animal-list'
      if (customerId) {
        url = url + '?customer_id=' + customerId
      }
      const response = await post(url, headers, data)
      return response.data
    } else {
      const animalListLib = new AnimalListLib()
      const response = await animalListLib.create(data, {query:{customer_id: customerId}})
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const createAnimal = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/v2/animal'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const animalLib = new AnimalLib()
      const response = await animalLib.create(data, {})
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const getAnimalById = async (headers, id) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/animal/' +
        id
      const response = await get(url, headers)
      return response.data
    } else {
      const animalLib = new AnimalLib()
      const response = await animalLib.get(id, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const updateAnimalById = async (headers, id, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/animal/' +
        id
      const response = await patch(url, headers, data)
      return response.data
    } else {
      const animalLib = new AnimalLib()
      const response = await animalLib.patch(id, data, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const getReferenceData = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/refs'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const referenceLib = new ReferencesLib()
      const response = await referenceLib.create(data, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const listDocuments = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      let url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/document-list'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const documentListLib = new DocumentListLib()
      const response = await documentListLib.create(data, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

const uploadFile = async (headers, data) => {
  try {
    let url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/v2/file'
    /*const req = await fetch(url, {
      method: "POST",
      headers,
      data
    })
    console.log('req = ', req)
    return req.data*/
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

/*const createDocument = async (headers, data) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/v2/document'
      const response = await post(url, headers, data)
      return response.data
    } else {
      const documentLib = new DocumentLib()
      const response = await documentLib.create(data, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

const getFile = async (headers, documentId) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      `/v2/file/${documentId}`
    const response = await RNFetchBlob.fetch('GET', url, headers)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const getFileByKey = async (headers, s3Key) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      `/get-file-by-key?key=${s3Key}`
    const response = await RNFetchBlob.fetch('GET', url, headers)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

/*const getDocumentById = async (headers, id) => {
  try {
    const SUPPORTED_OFFLINE = true
    if (
      configurationJSON().IS_SERVER === 'True' ||
      SUPPORTED_OFFLINE === false
    ) {
      const url =
        configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
        '/v2/document/' +
        id
      const response = await get(url, headers)
      return response.data
    } else {
      const documentLib = new DocumentLib()
      const response = await documentLib.get(id, headers)
      return response
    }
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

/*const updateDocumentById = async (headers, id, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      '/v2/document/' +
      id
    const response = await patch(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}*/

const getServerReferenceTimeForSync = async (headers) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE +
      `/sync/get-reference-time`
    const response = await get(url, headers)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const sendClientDeltaForSync = async (headers, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/sync/set-client-delta'
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const getServerDeltaForSync = async (headers, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/sync/get-server-delta'
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const updateLastSyncTimeForTables = async (headers, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/sync/set-last-sync-time'
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

const sendFCMTokenToServer = async (headers, data) => {
  try {
    const url =
      configurationJSON().SERVICE_END_POINTS.BACK_END_SERVICE + '/set-fcm-token'
    const response = await post(url, headers, data)
    return response.data
  } catch (error) {
    console.log('error = ', error)
    throw error
  }
}

module.exports = {
  checkIfPhoneNumberIsOfStaff,
  loginMobileUser,
  // listFarmers,
  // createFarmer,
  // getFarmerById,
  // updateFarmerById,
  // listAnimals,
  // createAnimal,
  // getAnimalById,
  // updateAnimalById,
  // getReferenceData,
  // listDocuments,
  uploadFile,
  getFile,
  getFileByKey,
  // createDocument,
  // getDocumentById,
  // updateDocumentById,
  getServerReferenceTimeForSync,
  sendClientDeltaForSync,
  getServerDeltaForSync,
  updateLastSyncTimeForTables,
  sendFCMTokenToServer
}
