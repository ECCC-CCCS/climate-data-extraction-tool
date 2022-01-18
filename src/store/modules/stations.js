/*
Vuex module for the climate stations and related selections
*/

import axios from 'axios'

// initial state
const state = {
  province: 'null',
  climateDailyStationGeoJson: {
    features: []
  },
  climateHourlyStationGeoJson: {
    features: []
  },
  climateNormalsStationGeoJson: {
    features: []
  },
  climateMonthlyStationGeoJson: {
    features: []
  },
  ahccdStationGeoJson: {
    features: []
  },
  hydroStationGeoJson: {
    features: []
  },
  ltceStationGeoJson: {
    features: []
  },
  isLoadingStations: false,
  isLoadingAllHydroStations: false,
  stationIdSelected: [],
  maxStationSelection: 9999,
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
  changeDailyStation (state, payload) {
    state.climateDailyStationGeoJson = payload
  },
  changeMonthlyStation (state, payload) {
    state.climateMonthlyStationGeoJson = payload
  },
  changeNormalsStation (state, payload) {
    state.climateNormalsStationGeoJson = payload
  },
  changeAhccdStation (state, payload) {
    state.ahccdStationGeoJson = payload
  },
  changeLtceStation (state, payload) {
    state.ltceStationGeoJson = payload
  },
  changeHydroStation (state, payload) {
    state.hydroStationGeoJson = payload
  },
  addSingleStationIdSelected (state, payload) {
    if (state.stationIdSelected.length < state.maxStationSelection) { // at most 20
      state.stationIdSelected.push(payload)
    }
  },
  changeStationIdSelected (state, payload) {
    state.stationIdSelected = payload
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
  retrieveHydroStations: function ({ state, commit }, url) {
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
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeHydroStation', response.data)
        if (state.hydroStationActive === false) {
          commit('changeStationState', {
            stateProp: 'retrievedAllHydroStations',
            stateValue: true
          })
        }
      })
      .finally(() => {
        commit('finishLoadingStations')
        if (!activeOnly) {
          commit('finishLoadingAllHydroStations')
        }
      })
  },
  retrieveClimateStations: function ({ state, commit }, url) { // daily
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeDailyStation', response.data)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
  },
  retrieveClimateHourlyStations: function ({ state, commit }, url) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeHourlyStation', response.data)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
  },
  retrieveClimateNormalsStations: function ({ state, commit }, url) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeNormalsStation', response.data)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
  },
  retrieveClimateMonthlyStations: function ({ state, commit }, url) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeMonthlyStation', response.data)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
  },
  retrieveAhccdStations: function ({ state, commit }, url) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        commit('changeAhccdStation', response.data)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
  },
  retrieveLtceStations: function ({ state, commit }, {url, uniqueCol}) {
    state.cancelSourceStation.cancel('Cancelling existing station request')
    state.cancelSourceStation = axios.CancelToken.source()
    commit('startLoadingStations')
    axios.get(url, { cancelToken: state.cancelSourceStation.token })
      .then((response) => {
        // reduce rows by uniqueCol
        let uniqueResponseData = {
          features: []
        }
        response.data.features.forEach((row) => {
          let i = uniqueResponseData.features.findIndex(x => x.properties[uniqueCol] === row.properties[uniqueCol])
          if (i <= -1) {
            uniqueResponseData.features.push(row)
          } else {
            if (!uniqueResponseData.features[i].properties['ELEMENT_NAME_E'].includes(row.properties['ELEMENT_NAME_E'])) {
              uniqueResponseData.features[i].properties['ELEMENT_NAME_E'] += ', ' + row.properties['ELEMENT_NAME_E']
            }
          }
        })
        commit('changeLtceStation', uniqueResponseData)
      })
      .finally(() => {
        commit('finishLoadingStations')
      })
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
