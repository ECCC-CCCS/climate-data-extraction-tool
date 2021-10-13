/*
Vuex module for the climate stations and related selections
*/

import axios from 'axios'

// initial state
const state = {
  province: 'null',
  hydroStationGeoJson: {
    features: []
  },
  climateDailyStationGeoJson: { // daily
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
  ltceStationGeoJson: {
    features: []
  },
  isLoadingStations: false,
  isLoadingAllHydroStations: false,
  stationIdSelected: [],
  maxStationSelection: 20,
  minDateClimateDaily: null,
  minDateClimateMonthly: null,
  dateStart: null,
  dateEnd: null,
  hydroStationActive: true,
  retrievedAllHydroStations: false,
  cancelSourceStation: axios.CancelToken.source()
}

// getters
const getters = {
  getClimateDailyMinDate (state) {
    return state.minDateClimateDaily
  },
  getClimateMonthlyMinDate (state) {
    return state.minDateClimateMonthly
  }
}

// mutations
const mutations = {
  changeStationState (state, payload) { // universal state mutation changer
    // payload is object with {stateProp, stateValue}
    state[payload.stateProp] = payload.stateValue
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
  addStationIdSelectedMutation (state, payload) {
    if (state.stationIdSelected.length < state.maxStationSelection) { // at most 20
      state.stationIdSelected.push(payload)
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
    commit('addStationIdSelectedMutation', id)
  },
  removeStationIdSelected: function ({ commit }, id) {
    commit('removeStationIdSelectedMutation', id)
  },
  clearStationIdSelected: function ({ commit }) {
    commit('clearStationIdSelectedMutation')
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
