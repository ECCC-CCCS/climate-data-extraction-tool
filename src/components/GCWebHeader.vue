<template>
  <header role="banner">
    <div id="wb-bnr" class="container">
      <section id="wb-lng" class="visible-md visible-lg text-right" v-if="$route.name !== '404'">
        <h2 class="wb-inv" v-translate t-context="Canada.ca Theme">Language selection</h2>
        <div class="row">
          <div class="col-md-12">
            <ul class="list-inline margin-bottom-none">
              <li
                v-for="(language, lang) in langs"
                v-bind:key="lang"
                v-show="activeLocale !== lang">
                <a
                  v-if="isDeploymentServer"
                  v-bind:lang="lang"
                  v-bind:href="hrefLang(lang)">{{ language }}</a>
                <router-link
                  v-else
                  v-bind:lang="lang"
                  v-bind:to="routePath(lang)">{{ language }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="row" v-if="$route.name === '404'">
        <div class="col-sm-6">
          <img id="gcwu-sig" :src="src_sig_blk" alt="Government of Canada / Gouvernement du Canada">
        </div>
        <div class="col-sm-6">
          <img id="wmms" src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg" :alt="$pgettext('Canada.ca Theme', 'Symbol of the Government of Canada')">
        </div>
      </div>

      <div class="row" v-else>
        <div class="brand col-xs-8 col-sm-9 col-md-6">
          <a v-bind:href="'https://www.canada.ca/' + activeLocale + '.html'"><img v-bind:src="src_sig_blk" alt=""><span class="wb-inv"> <span lang="en">Government of Canada</span> / <span lang="fr">Gouvernement du Canada</span></span></a>
        </div>
        <section class="wb-mb-links col-xs-4 col-sm-3 visible-sm visible-xs" id="wb-glb-mn">
          <h2>Search and menus</h2>
          <ul class="list-inline text-right chvrn">
            <li><a href="#mb-pnl" v-bind:title="$pgettext('Canada.ca Theme', 'Search and menus')" aria-controls="mb-pnl" class="overlay-lnk" role="button"><span class="glyphicon glyphicon-search"><span class="glyphicon glyphicon-th-list"><span class="wb-inv" v-translate t-context="Canada.ca Theme">Search and menus</span></span></span></a></li>
          </ul>
          <div id="mb-pnl"></div>
        </section>
      </div>
    </div>
    <nav role="navigation" id="wb-sm" v-bind:data-ajax-replace="'./static/ajax/sitemenu-' + activeLocale + '.html'" data-trgt="mb-pnl" class="wb-menu visible-md visible-lg" typeof="SiteNavigationElement" v-if="$route.name !== '404'">
      <div class="container nvbar">
        <h2 v-translate t-context="Canada.ca Theme">Topics menu</h2>
        <div class="row">
          <ul class="list-inline menu">
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/jobs.html'" v-translate t-context="Canada.ca Theme">Jobs</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/immigration-citizenship.html'" v-translate t-context="Canada.ca Theme">Immigration</a></li>
            <li><a v-bind:href="'https://travel.gc.ca/'" v-translate t-context="Canada.ca Theme">Travel</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/business.html'" v-translate t-context="Canada.ca Theme">Business</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/benefits.html'" v-translate t-context="Canada.ca Theme">Benefits</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/health.html'" v-translate t-context="Canada.ca Theme">Health</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services/taxes.html'" v-translate t-context="Canada.ca Theme">Taxes</a></li>
            <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/services.html'" v-translate t-context="Canada.ca Theme">More services</a></li>
          </ul>
        </div>
      </div>
    </nav>

    <nav role="navigation" id="wb-bc" property="breadcrumb" v-if="$route.name !== '404'">
      <h2 v-translate t-context="Canada.ca Theme">You are here:</h2>
      <div class="container">
        <div class="row">
          <ol class="breadcrumb">
            <li>
              <a v-bind:href="climateLinks.canada.url[activeLocale]">{{ climateLinks.canada.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.enr.url[activeLocale]">{{ climateLinks.enr.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.weatherClimateHazards.url[activeLocale]">{{ climateLinks.weatherClimateHazards.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.climateChange.url[activeLocale]">{{ climateLinks.climateChange.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.climateAdapt.url[activeLocale]">{{ climateLinks.climateAdapt.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.climateServices.url[activeLocale]">{{ climateLinks.climateServices.title }}</a>
            </li>
            <li>
              <a v-bind:href="climateLinks.climateDisplay.url[activeLocale]">{{ climateLinks.climateDisplay.title }}</a>
            </li>
            <li v-show="$route.name !== 'home'">
              <router-link v-show="$route.name !== 'home'" to="/"><translate t-context="Title">Climate data extraction tool</translate></router-link>
              <span v-show="$route.name == 'home'" v-translate>Climate data extraction tool</span>
            </li>
            <li v-show="$route.name !== 'home'">{{ currentRouteTitle }}</li>
          </ol>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'GCWebHeader',
  mixins: [ows, datasets],
  data () {
    return {
      langs: { // don't translate
        en: 'English',
        fr: 'Français'
      }
    }
  },
  methods: {
    hrefLang: function (langKey) {
      var lang = this.langShort(langKey)
      var langPath = lang + '_path'
      var href = this.WEB_SERVER[lang]
      if (this.isDeploymentServer) {
        href += this.APP_PATH[lang]
      }

      // Get lang2 route name
      if (this.$route.meta.hasOwnProperty(langPath)) {
        href += '#' + this.$route.meta[langPath]
      }

      return href
    },
    routePath: function (langKey) {
      var lang = this.langShort(langKey)
      var langPath = lang + '_path'
      if (this.$route.meta.hasOwnProperty(langPath)) {
        return this.$route.meta[langPath]
      } else {
        return this.$route.path
      }
    }
  },
  computed: {
    sameLangWebServer: function () {
      return this.WEB_SERVER.en === this.WEB_SERVER.fr
    },
    isDeploymentServer: function () {
      // is DEV, STAGE, OPS
      // Deployment server has 2 different app paths; for en and fr
      return this.APP_PATH.en !== this.APP_PATH.fr
    },
    src_to_root: function () {
      var src = '/'
      if (this.APP_PATH[this.activeLocale] !== '/') {
        src = this.APP_PATH[this.activeLocale] + '/'
      }
      return src
    },
    src_sig_blk: function () {
      return 'https://www.canada.ca/etc/designs/canada/wet-boew/assets/sig-blk-' + this.activeLocale + '.svg'
    }
  }
}
</script>

<style>
</style>
