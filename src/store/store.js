import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    province: 'null',
    hydroStationGeoJson: null,
    climateStationGeoJson: null,
    climateNormalsStationGeoJson: null,
    climateMonthlyStationGeoJson: null,
    ahccdStationGeoJson: null,
    stationIdSelected: [],
    bbox: null,
    bboxStationTotal: null,
    maxStationSelection: 20,
    minDateClimateDaily: null,
    minDateClimateMonthly: null,
    pointClickOn: false,
    clickLatLng: null,
    latestRelease: {}
  },
  mutations: {
    changeLatestRelease (state, payload) {
      state.latestRelease = payload
    },
    changeClickLatLng (state, payload) {
      state.clickLatLng = payload
    },
    changePointClickStatus (state, payload) {
      state.pointClickOn = payload
    },
    changeProvinceMutation (state, payload) {
      state.province = payload
    },
    changeHydroStations (state, payload) {
      state.hydroStationGeoJson = payload
    },
    changeClimateStations (state, payload) {
      state.climateStationGeoJson = payload
    },
    changeClimateNormalsStations (state, payload) {
      state.climateNormalsStationGeoJson = payload
    },
    changeClimateMonthlyStations (state, payload) {
      state.climateMonthlyStationGeoJson = payload
    },
    changeAhccdStations (state, payload) {
      state.ahccdStationGeoJson = payload
    },
    changeBBOXMutation (state, payload) {
      state.bbox = payload
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
    changeClimateDailyMinDate (state, payload) {
      state.minDateClimateDaily = payload
    },
    changeClimateMonthlyMinDate (state, payload) {
      state.minDateClimateMonthly = payload
    },
    changeBboxStationTotal (state, payload) {
      state.bboxStationTotal = payload
    }
  },
  actions: { // AJAX in stuff; change states
    retrieveLatestRelease: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeLatestRelease', response.data)
        ))
    },
    setClickLatLng: function ({ commit }, latLng) {
      commit('changeClickLatLng', latLng)
    },
    setPointClickStatus: function ({ commit }, status) {
      commit('changePointClickStatus', status)
    },
    changeProvince: function ({ commit }, newProv) {
      commit('changeProvinceMutation', newProv)
    },
    changeBBOX: function ({ commit }, newBBOX) {
      commit('changeBBOXMutation', newBBOX)
    },
    retrieveHydroStations: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeHydroStations', response.data)
        ))
    },
    retrieveClimateStations: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeClimateStations', response.data)
        ))
    },
    retrieveClimateNormalsStations: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeClimateNormalsStations', response.data)
        ))
    },
    retrieveClimateMonthlyStations: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeClimateMonthlyStations', response.data)
        ))
    },
    retrieveAhccdStations: function ({ commit }, url) {
      axios.get(url)
        .then(response => (
          commit('changeAhccdStations', response.data)
        ))
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
      commit('changeClimateDailyMinDate', minDate)
    },
    setClimateMonthlyMinDate: function ({ commit }, minDate) {
      commit('changeClimateMonthlyMinDate', minDate)
    },
    setBboxStationTotal: function ({ commit }, total) {
      commit('changeBboxStationTotal', total)
    }
  },
  getters: {
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
    getBboxStationsTotal: function (state) {
      return state.bboxStationTotal
    }
  }
})
