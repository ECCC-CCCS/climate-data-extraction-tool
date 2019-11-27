import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    province: 'null',
    hydroStationGeoJson: {
      features: []
    },
    climateStationGeoJson: {
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
    isLoadingStations: false,
    stationIdSelected: [],
    bbox: null,
    bboxStationTotal: null,
    maxStationSelection: 20,
    minDateClimateDaily: null,
    minDateClimateMonthly: null,
    pointClickOn: false,
    clickLatLng: null,
    latestRelease: {},
    hydroStationActive: true,
    retrievedAllHydroStations: false
  },
  mutations: {
    changeState (state, payload) { // universal state mutation changer
      // payload is object with {stateProp, stateValue}
      state[payload.stateProp] = payload.stateValue
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
    changeIsLoadingStations (state, status) {
      state.isLoadingStations = status
    }
  },
  actions: {
    setHydroStationActive: function ({ commit }, toggle) {
      commit('changeState', {
        stateProp: 'hydroStationActive',
        stateValue: toggle
      })
    },
    retrieveLatestRelease: function ({ commit }, url) {
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'latestRelease',
            stateValue: response.data
          })
        })
    },
    setClickLatLng: function ({ commit }, latLng) {
      commit('changeState', {
        stateProp: 'clickLatLng',
        stateValue: latLng
      })
    },
    setPointClickStatus: function ({ commit }, status) {
      commit('changeState', {
        stateProp: 'pointClickOn',
        stateValue: status
      })
    },
    changeProvince: function ({ commit }, newProv) {
      commit('changeState', {
        stateProp: 'province',
        stateValue: newProv
      })
    },
    changeBBOX: function ({ commit }, newBBOX) {
      commit('changeState', {
        stateProp: 'bbox',
        stateValue: newBBOX
      })
    },
    retrieveHydroStations: function ({ commit, state }, url) {
      if (state.retrievedAllHydroStations) {
        return false
      }
      commit('changeIsLoadingStations', true)
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'hydroStationGeoJson',
            stateValue: response.data
          })
          if (state.hydroStationActive === false) {
            commit('changeState', {
              stateProp: 'retrievedAllHydroStations',
              stateValue: true
            })
          }
        })
        .finally(() => {
          commit('changeIsLoadingStations', false)
        })
    },
    retrieveClimateStations: function ({ commit }, url) {
      commit('changeIsLoadingStations', true)
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'climateStationGeoJson',
            stateValue: response.data
          })
        })
        .finally(() => {
          commit('changeIsLoadingStations', false)
        })
    },
    retrieveClimateNormalsStations: function ({ commit }, url) {
      commit('changeIsLoadingStations', true)
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'climateNormalsStationGeoJson',
            stateValue: response.data
          })
        })
        .finally(() => {
          commit('changeIsLoadingStations', false)
        })
    },
    retrieveClimateMonthlyStations: function ({ commit }, url) {
      commit('changeIsLoadingStations', true)
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'climateMonthlyStationGeoJson',
            stateValue: response.data
          })
        })
        .finally(() => {
          commit('changeIsLoadingStations', false)
        })
    },
    retrieveAhccdStations: function ({ commit }, url) {
      commit('changeIsLoadingStations', true)
      axios.get(url)
        .then((response) => {
          commit('changeState', {
            stateProp: 'ahccdStationGeoJson',
            stateValue: response.data
          })
        })
        .finally(() => {
          commit('changeIsLoadingStations', false)
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
      commit('changeState', {
        stateProp: 'minDateClimateDaily',
        stateValue: minDate
      })
    },
    setClimateMonthlyMinDate: function ({ commit }, minDate) {
      commit('changeState', {
        stateProp: 'minDateClimateMonthly',
        stateValue: minDate
      })
    },
    setBboxStationTotal: function ({ commit }, total) {
      commit('changeState', {
        stateProp: 'bboxStationTotal',
        stateValue: total
      })
    }
  },
  getters: {
    getIsLoadingStations (state) {
      return state.isLoadingStations
    },
    getRetrievedAllHydroStations (state) {
      return state.retrievedAllHydroStations
    },
    getHydroStationActive (state) {
      return state.hydroStationActive
    },
    getLatestRelease (state) {
      return state.latestRelease
    },
    getClickLatLng (state) {
      return state.clickLatLng
    },
    getPointClickStatus (state) {
      return state.pointClickOn
    },
    getProvince (state) {
      return state.province
    },
    getHydroStations (state) {
      return state.hydroStationGeoJson
    },
    getClimateStations (state) {
      return state.climateStationGeoJson
    },
    getClimateNormalsStations (state) {
      return state.climateNormalsStationGeoJson
    },
    getClimateMonthlyStations (state) {
      return state.climateMonthlyStationGeoJson
    },
    getAhccdStations (state) {
      return state.ahccdStationGeoJson
    },
    getStationIdSelected (state) {
      return state.stationIdSelected
    },
    getBBOX (state) {
      return state.bbox
    },
    getMaxStationSelection (state) {
      return state.maxStationSelection
    },
    getClimateNormalsMinDate (state) {
      return state.minDateClimateDaily
    },
    getClimateMonthlyMinDate (state) {
      return state.minDateClimateMonthly
    },
    getBboxStationsTotal (state) {
      return state.bboxStationTotal
    }
  }
})
