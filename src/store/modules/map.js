/*
Vuex module for the interactive map and map-related selections
*/

// initial state
const state = {
  bbox: null,
  bboxStationTotal: null,
  pointClickOn: false,
  clickLatLng: null
}

// getters
const getters = {
  getBboxStationsTotal (state) {
    return state.bboxStationTotal
  }
}

// mutations
const mutations = {
  changeMapState (state, payload) { // universal state mutation changer
    // payload is object with {stateProp, stateValue}
    state[payload.stateProp] = payload.stateValue
  }
}

// actions
const actions = {
  setClickLatLng ({ commit }, latLng) {
    commit('changeMapState', {
      stateProp: 'clickLatLng',
      stateValue: latLng
    })
  },
  setPointClickStatus ({ commit }, status) {
    commit('changeMapState', {
      stateProp: 'pointClickOn',
      stateValue: status
    })
  },
  changeBBOX ({ commit }, newBBOX) {
    commit('changeMapState', {
      stateProp: 'bbox',
      stateValue: newBBOX
    })
  },
  setBboxStationTotal ({ commit }, total) {
    commit('changeMapState', {
      stateProp: 'bboxStationTotal',
      stateValue: total
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
