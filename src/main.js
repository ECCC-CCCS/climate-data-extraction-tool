// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueMoment from 'vue-moment'
import App from './App'
import router from './router'
import store from './store/store'

// Localization plugin
import { VueGettext } from 'vue-i18n-gettext'
// import marked from 'marked' // The `marked` module can extend the gettext module so that it can render markdown layouts.
import gettextConfig from '../config/i18n'
Vue.use(VueGettext, gettextConfig)

Vue.use(VueMoment)

Vue.config.productionTip = process.env.NODE_ENV === 'production'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
