import Vue from 'vue'
import Vuex from 'vuex'

import map from './modules/map'
import stations from './modules/stations'
import news from './modules/news'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    map,
    stations,
    news
  },
  state: {

  },
  getters: {

  },
  mutations: {

  },
  actions: {

  }
})
