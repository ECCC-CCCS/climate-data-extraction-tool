import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Localization plugin
import { VueGettext } from 'vue-i18n-gettext'
// import marked from 'marked' // The `marked` module can extend the gettext module so that it can render markdown layouts.
import gettextConfig from './i18n.js'

createApp(App).use(store).use(router).use(require('vue-moment')).use(VueGettext, gettextConfig).mount('#app')
