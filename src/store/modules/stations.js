/*
Vuex module for the climate stations and related selections
*/

import axios from 'axios'

// Limit for pagination
const OAPI_FEATURES_LIMIT = 10000

// initial state
const state = {
  province: 'null',
  climateDailyStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  climateHourlyStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  climateNormalsStationGeoJson: {
    type: 'FeatureCollection',
    features: [] // Start with an empty array
  },
  climateMonthlyStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  ahccdStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  hydroStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  ltceStationGeoJson: {
    type: 'FeatureCollection',
    features: []
  },
  isLoadingStations: false,
  isLoadingAllHydroStations: false,
  stationIdSelected: [],
  maxStationSelection: 950,
  minDateClimateDaily: null,
  minDateClimateHourly: null,
  minDateClimateMonthly: null,
  dateStart: null, // momentjs date
  dateEnd: null, // momentjs date
  hydroStationActive: true,
  retrievedAllHydroStations: false,
  cancelSourceStation: axios.CancelToken.source()
}

// getters
const getters = {
  numStationClimateHourly (state) {
    return state.climateHourlyStationGeoJson.features.length
  },
  numStationClimateDaily (state) {
    return state.climateDailyStationGeoJson.features.length
  },
  numStationClimateNormals (state) {
    return state.climateNormalsStationGeoJson.features.length
  },
  numStationClimateMonthly (state) {
    return state.climateMonthlyStationGeoJson.features.length
  },
  numStationAhccd (state) {
    return state.ahccdStationGeoJson.features.length
  },
  numStationLtce (state) {
    return state.ltceStationGeoJson.features.length
  },
  numStationHydro (state) {
    return state.hydroStationGeoJson.features.length
  },
  getClimateHourlyMinDate (state) {
    return state.minDateClimateHourly
  },
  getClimateDailyMinDate (state) {
    return state.minDateClimateDaily
  },
  getClimateMonthlyMinDate (state) {
    return state.minDateClimateMonthly
  },
  dateStart (state) {
    if (state.dateStart == 'Invalid date') {
      return null
    } else {
      return state.dateStart
    }
  },
  dateEnd (state) {
    if (state.dateEnd == 'Invalid date') {
      return null
    } else {
      return state.dateEnd
    }
  },
  numStationSelected (state) {
    return state.stationIdSelected.length
  }
}

// mutations
const mutations = {
  changeStationState (state, payload) { // universal state mutation changer
    // payload is object with {stateProp, stateValue}
    state[payload.stateProp] = payload.stateValue
  },
  changeHourlyStation (state, payload) {
    state.climateHourlyStationGeoJson = payload
  },
  appendHourlyStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.climateHourlyStationGeoJson = {
        ...state.climateHourlyStationGeoJson,
        features: [
          ...state.climateHourlyStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeDailyStation (state, payload) {
    state.climateDailyStationGeoJson = payload
  },
  appendDailyStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.climateDailyStationGeoJson = {
        ...state.climateDailyStationGeoJson,
        features: [
          ...state.climateDailyStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeMonthlyStation (state, payload) {
    state.climateMonthlyStationGeoJson = payload
  },
  appendMonthlyStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.climateMonthlyStationGeoJson = {
        ...state.climateMonthlyStationGeoJson,
        features: [
          ...state.climateMonthlyStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeNormalsStation (state, payload) {
    state.climateNormalsStationGeoJson = payload
  },
  appendNormalsStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.climateNormalsStationGeoJson = {
        ...state.climateNormalsStationGeoJson,
        features: [
          ...state.climateNormalsStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeAhccdStation (state, payload) {
    state.ahccdStationGeoJson = payload
  },
  appendAhccdStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.ahccdStationGeoJson = {
        ...state.ahccdStationGeoJson,
        features: [
          ...state.ahccdStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeLtceStation (state, payload) {
    state.ltceStationGeoJson = payload
  },
  appendLtceStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.ltceStationGeoJson = {
        ...state.ltceStationGeoJson,
        features: [
          ...state.ltceStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  changeHydroStation (state, payload) {
    state.hydroStationGeoJson = payload
  },
  appendHydroStation (state, payload) {
    if (
      payload &&
      Array.isArray(payload.features)
    ) {
      state.hydroStationGeoJson = {
        ...state.hydroStationGeoJson,
        features: [
          ...state.hydroStationGeoJson.features,
          ...payload.features
        ]
      }
    } else {
      console.warn('Invalid GeoJSON payload', payload)
    }
  },
  addSingleStationIdSelected (state, payload) {
    if (state.stationIdSelected.length < state.maxStationSelection) { // limitation
      state.stationIdSelected.push(payload)
    }
  },
  changeStationIdSelected (state, payload) {
    if (payload.length > state.maxStationSelection) {
      state.stationIdSelected = payload.slice(0, state.maxStationSelection)
    } else {
      state.stationIdSelected = payload
    }
  },
  removeStationIdSelectedMutation (state, payload) {
    let index = state.stationIdSelected.indexOf(payload)
    if (index > -1) {
      state.stationIdSelected.splice(index, 1)
    }
  },
  clearStationIdSelectedMutation (state) {
    state.stationIdSelected = []
  },
  startLoadingStations (state) {
    state.isLoadingStations = true
  },
  finishLoadingStations (state) {
    state.isLoadingStations = false
  },
  startLoadingAllHydroStations (state) {
    state.isLoadingAllHydroStations = true
  },
  finishLoadingAllHydroStations (state) {
    state.isLoadingAllHydroStations = false
  }
}

// actions
const actions = {
  setHydroStationActive: function ({ commit }, toggle) {
    commit('changeStationState', {
      stateProp: 'hydroStationActive',
      stateValue: toggle
    })
  },
  changeProvince: function ({ commit }, newProv) {
    commit('changeStationState', {
      stateProp: 'province',
      stateValue: newProv
    })
  },
  retrieveHydroStations: async function ({ state, commit }, {url}) {
    const activeOnly = url.includes('STATUS_EN=Active')
    if (state.retrievedAllHydroStations) {
      return false
    }
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    if (!activeOnly) {
      commit('startLoadingAllHydroStations')
    }
    commit('startLoadingStations')

    // Clear out existing data first
    state.hydroStationGeoJson.features = []

    try {
      // Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendHydroStation', response.data)
        if (state.hydroStationActive === false) {
          commit('changeStationState', {
            stateProp: 'retrievedAllHydroStations',
            stateValue: true
          })
        }
      })

      commit('finishLoadingStations')

      if (!activeOnly) {
        commit('finishLoadingAllHydroStations')
      }

    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
      commit('finishLoadingStations')
      commit('finishLoadingAllHydroStations')
    }
  },
  retrieveClimateStations: async function ({ state, commit }, {url}) { // daily
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.climateDailyStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendDailyStation', response.data)
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  retrieveClimateHourlyStations: async function ({ state, commit }, {url}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.climateHourlyStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendHourlyStation', response.data)
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  retrieveClimateNormalsStations: async function ({ state, commit }, {url}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.climateNormalsStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendNormalsStation', response.data)
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  retrieveClimateMonthlyStations: async function ({ state, commit }, {url}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.climateMonthlyStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendMonthlyStation', response.data)
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  retrieveAhccdStations: async function ({ state, commit }, {url}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.ahccdStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendAhccdStation', response.data)
      })
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  retrieveLtceStations: async function ({ state, commit }, {url, uniqueCol}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    state.ltceStationGeoJson.features = []

    // GET via pagination of stations
    try {
      // 💡 Retrieve total number of stations first
      const hitResponse = await axios.get(`${url}&resulttype=hits`)
      const totalStations = hitResponse.data.numberMatched


      // Paginate requests based on totalStations
      const requests = []
      for (let offset = 0; offset < totalStations; offset += OAPI_FEATURES_LIMIT) {
        const request = axios.get(`${url}&offset=${offset}&limit=${OAPI_FEATURES_LIMIT}`, {
          cancelToken: state.cancelSourceStation.token
        })
        requests.push(request)
      }

      // Wait for all paginated GETs to resolve
      const responses = await Promise.all(requests)

      // Commit results
      responses.forEach(response => {
        commit('appendLtceStation', response.data)
      })

      // reduce stations by uniqueCol
      let uniqueFeatures = []
      state.ltceStationGeoJson.features.forEach((row) => {
        let i = uniqueFeatures.findIndex(x => x.properties[uniqueCol] === row.properties[uniqueCol])
        if (i <= -1) {
          uniqueFeatures.push(row)
        } else {
          if (!uniqueFeatures[i].properties['ELEMENT_NAME_E'].includes(row.properties['ELEMENT_NAME_E'])) {
            uniqueFeatures[i].properties['ELEMENT_NAME_E'] += ', ' + row.properties['ELEMENT_NAME_E']
          }
        }
      })
      state.ltceStationGeoJson = {
        ...state.ltceStationGeoJson,
        features: uniqueFeatures
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.warn('Station fetch canceled:', error.message)
      } else {
        console.error('Error fetching stations:', error)
      }
    } finally {
      // Always mark loading as finished
      commit('finishLoadingStations')
    }
  },
  addStationIdSelected: function ({ commit }, id) {
    commit('addSingleStationIdSelected', id)
  },
  setStationIdSelected: function ({ commit }, idList) {
    commit('changeStationIdSelected', idList)
  },
  removeStationIdSelected: function ({ commit }, id) {
    commit('removeStationIdSelectedMutation', id)
  },
  clearStationIdSelected: function ({ commit }) {
    commit('clearStationIdSelectedMutation')
  },
  setClimateHourlyMinDate: function ({ commit }, minDate) {
    commit('changeStationState', {
      stateProp: 'minDateClimateHourly',
      stateValue: minDate
    })
  },
  setClimateDailyMinDate: function ({ commit }, minDate) {
    commit('changeStationState', {
      stateProp: 'minDateClimateDaily',
      stateValue: minDate
    })
  },
  setClimateMonthlyMinDate: function ({ commit }, minDate) {
    commit('changeStationState', {
      stateProp: 'minDateClimateMonthly',
      stateValue: minDate
    })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
