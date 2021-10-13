/*
Vuex module for latest release or news
*/

import axios from 'axios'

// initial state
const state = {
  latestRelease: {}
}

// getters
const getters = {

}

// mutations
const mutations = {
  changeNewsState (state, payload) { // universal state mutation changer
    // payload is object with {stateProp, stateValue}
    state[payload.stateProp] = payload.stateValue
  }
}

// actions
const actions = {
  retrieveLatestRelease: function ({ commit }, url) {
    axios.get(url)
      .then((response) => {
        commit('changeNewsState', {
          stateProp: 'latestRelease',
          stateValue: response.data
        })
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
