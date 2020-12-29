import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// IE 11 Polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

// Localization plugin
import { VueGettext } from 'vue-i18n-gettext'
// import marked from 'marked' // The `marked` module can extend the gettext module so that it can render markdown layouts.
import gettextConfig from './i18n.js'

Vue.config.productionTip = false

Vue.use(require('vue-moment'))
Vue.use(VueGettext, gettextConfig)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
