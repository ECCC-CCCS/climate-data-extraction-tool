<template>
  <div id="app">
    <gc-skip></gc-skip>
    <gc-header></gc-header>
    <div class="container">
      <div class="row">
        <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
          <router-view/>
        </main>
        <dataset-menu></dataset-menu>
      </div>
    </div>
    <gc-footer></gc-footer>
  </div>
</template>

<script>
import GCWebHeader from './components/GCWebHeader.vue'
import GCWebFooter from './components/GCWebFooter.vue'
import GCWebSkip from './components/GCWebSkip.vue'
import { ows } from './components/mixins/ows.js'
import { datasets } from './components/mixins/datasets.js'
import DatasetMenu from './components/DatasetMenu.vue'

export default {
  name: 'App',
  mixins: [ows, datasets],
  components: {
    'gc-header': GCWebHeader,
    'gc-footer': GCWebFooter,
    'gc-skip': GCWebSkip,
    DatasetMenu
  },
  created: function () {
    // determine language based on current URL matching
    this.updateLangFromAppPath()

    this.updateLangFromRoute()

    // Update title based on current route
    this.updatePageTitle()
  },
  watch: {
    '$route': function () {
      // change language based on route path changes (alias)
      this.updateLangFromRoute()
      this.updatePageTitle()
    }
  },
  data () {
    return {
      title404: {
        en: "We couldn't find that Web page (Error 404)",
        fr: 'Nous ne pouvons trouver cette page Web (Erreur 404)'
      }
    }
  },
  computed: {
    appTitle: function () {
      return this.$pgettext('Title', 'Climate data extraction tool')
    }
  },
  methods: {
    updatePageTitle: function () {
      // Change <title> based on current route
      document.title = this.appTitle
      if (this.$route.name === '404') {
        document.title = this.title404.fr + ' / ' + this.title404.en + ' - ' + this.appTitle
      } else if (this.$route.path !== '/') {
        document.title += ' - ' + this.currentRouteTitle
      }
    },
    updateLangFromRoute: function () {
      // Change the lang based on the current route (path vs alias)
      let currentPath = this.$route.path
      let currentFrPath = ''
      if (Object.prototype.hasOwnProperty.call(this.$route.meta, 'fr_path')) {
        currentFrPath = this.$route.meta.fr_path
      }

      if (currentFrPath !== '') { // Don't convert on homepage; updateLangFromAppPath will do that
        if (currentPath === currentFrPath) { // fr
          this.$i18n.activeLocale = 'fr'
        } else { // en
          this.$i18n.activeLocale = 'en'
        }
        this.updateHtmlLang()
      }
    },
    updateLangFromAppPath: function () {
      let currentURL = document.URL

      if (currentURL.includes(this.APP_PATH.fr) && this.APP_PATH.fr !== '/') {
        this.$i18n.activeLocale = 'fr'
      } else {
        this.$i18n.activeLocale = 'en'
      }
      this.updateHtmlLang()
    },
    updateHtmlLang: function () {
      // Set <html> lang
      const html = document.documentElement // <html>
      html.setAttribute('lang', this.$i18n.activeLocale)
    }
  }
}
</script>

<style>
.station_active {
  color: #55FF55;
}
.station_inactive {
  color: #FF0000;
}
.disabledOverlay {
  pointer-events: none;
  background-color: #FFF;
  opacity: 0.7 !important;
  filter: alpha(opacity = 0);
  zoom: 1;
}
label strong.error {
  display: inline-block;
  width: 100%;
}
details {
  list-style-type: none; /*IE 11 fix*/
}
</style>
