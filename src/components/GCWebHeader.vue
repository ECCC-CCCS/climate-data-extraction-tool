<template>
  <header>
    <div id="wb-bnr" class="container">
      <section id="wb-lng" class="text-right">
        <h2 class="wb-inv" v-translate t-context="Canada.ca Theme">Language selection</h2>
        <div class="row">
          <div class="col-md-12">
            <ul class="list-inline margin-bottom-none">
              <li
                v-for="(language, lang) in langs"
                :key="lang"
                v-show="activeLocale !== lang">
                <a
                  v-if="isDeploymentServer"
                  :lang="lang"
                  :href="hrefLang(lang)">{{ language }}</a>
                <router-link
                  v-else
                  :lang="lang"
                  :to="routePath(lang)">{{ language }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <div class="row">
        <div class="brand col-xs-5 col-md-4">
          <a :href="'https://www.canada.ca/' + activeLocale + '.html'"><img :src="src_sig_blk" alt=""><span class="wb-inv"> <span lang="en">Government of Canada</span> / <span lang="fr">Gouvernement du Canada</span></span></a>
        </div>

        <section id="wb-srch" class="col-lg-8 text-right"><h2 v-translate t-context="Canada.ca Theme">Search</h2><form :action="'https://www.canada.ca/' + activeLocale + '/sr/srb.html'" method="get" name="cse-search-box" role="search" class="form-inline"><div class="form-group"><label for="wb-srch-q" class="wb-inv" v-translate t-context="Canada.ca Theme">Search Canada.ca</label> <input id="wb-srch-q" list="wb-srch-q-ac" class="wb-srch-q form-control" name="q" type="search" value="" size="34" maxlength="170" placeholder="Search Canada.ca"><datalist id="wb-srch-q-ac"></datalist></div><div class="form-group submit"><button type="submit" id="wb-srch-sub" class="btn btn-primary btn-small" name="wb-srch-sub"><span class="glyphicon-search glyphicon"></span><span class="wb-inv" v-translate t-context="Canada.ca Theme">Search</span></button></div></form></section>
      </div>
    </div>

    <nav class="gcweb-menu" typeof="SiteNavigationElement">
      <div class="container">
        <h2 class="wb-inv" v-translate t-context="Canada.ca Theme">Menu</h2>
        <button type="button" aria-haspopup="true" aria-expanded="false"><span class="wb-inv">Main </span>Menu <span class="expicon glyphicon glyphicon-chevron-down"></span></button>
        <ul role="menu" aria-orientation="vertical" :data-ajax-replace="'https://www.canada.ca/content/dam/canada/sitemenu/sitemenu-v2-' + activeLocale + '.html'">
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.job[activeLocale]" v-translate t-context="Canada.ca Theme">Jobs and the workplace</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.immigration[activeLocale]" v-translate t-context="Canada.ca Theme">Immigration and citizenship</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.travel[activeLocale]" v-translate t-context="Canada.ca Theme">Travel and tourism</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.business[activeLocale]" v-translate t-context="Canada.ca Theme">Business and industry</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.benefit[activeLocale]" v-translate t-context="Canada.ca Theme">Benefits</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.health[activeLocale]" v-translate t-context="Canada.ca Theme">Health</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.tax[activeLocale]" v-translate t-context="Canada.ca Theme">Taxes</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.environment[activeLocale]" v-translate t-context="Canada.ca Theme">Environment and natural resources</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.defence[activeLocale]" v-translate t-context="Canada.ca Theme">National security and defence</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.culture[activeLocale]" v-translate t-context="Canada.ca Theme">Culture, history and sport</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.policing[activeLocale]" v-translate t-context="Canada.ca Theme">Policing, justice and emergencies</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.transport[activeLocale]" v-translate t-context="Canada.ca Theme">Transport and infrastructure</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.canada[activeLocale]" v-translate t-context="Canada.ca Theme">Canada and the world</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.finance[activeLocale]" v-translate t-context="Canada.ca Theme">Money and finances</a></li>
          <li role="presentation"><a role="menuitem" tabindex="-1" :href="this.menuLink.science[activeLocale]" v-translate t-context="Canada.ca Theme">Science and innovation</a></li>
        </ul>
      </div>
    </nav>

    <nav id="wb-bc" property="breadcrumb" v-if="$route.name !== '404'">
      <h2 v-translate t-context="Canada.ca Theme">You are here:</h2>
      <div class="container">
        <div class="row">
          <ol class="breadcrumb">
            <li>
              <a :href="climateLinks.canada.url[activeLocale]">{{ climateLinks.canada.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.enr.url[activeLocale]">{{ climateLinks.enr.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.weatherClimateHazards.url[activeLocale]">{{ climateLinks.weatherClimateHazards.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.climateChange.url[activeLocale]">{{ climateLinks.climateChange.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.climateAdapt.url[activeLocale]">{{ climateLinks.climateAdapt.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.climateServices.url[activeLocale]">{{ climateLinks.climateServices.title }}</a>
            </li>
            <li>
              <a :href="climateLinks.climateDisplay.url[activeLocale]">{{ climateLinks.climateDisplay.title }}</a>
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
      },
      menuLink: {
        immigration: {
          en: 'https://www.canada.ca/en/services/immigration-citizenship.html',
          fr: 'https://www.canada.ca/fr/services/immigration-citoyennete.html'
        },
        job: {
          en: 'https://www.canada.ca/en/services/jobs.html',
          fr: 'https://www.canada.ca/fr/services/emplois.html'
        },
        business: {
          en: 'https://www.canada.ca/en/services/business.html',
          fr: 'https://www.canada.ca/fr/services/entreprises.html'
        },
        benefit: {
          en: 'https://www.canada.ca/en/services/benefits.html',
          fr: 'https://www.canada.ca/fr/services/prestations.html'
        },
        health: {
          en: 'https://www.canada.ca/en/services/health.html',
          fr: 'https://www.canada.ca/fr/services/sante.html'
        },
        tax: {
          en: 'https://www.canada.ca/en/services/taxes.html',
          fr: 'https://www.canada.ca/fr/services/impots.html'
        },
        environment: {
          en: 'https://www.canada.ca/en/services/environment.html',
          fr: 'https://www.canada.ca/fr/services/environnement.html'
        },
        travel: {
          en: 'https://travel.gc.ca/',
          fr: 'https://voyage.gc.ca/'
        },
        defence: {
          en: 'https://www.canada.ca/en/services/defence.html',
          fr: 'https://www.canada.ca/fr/services/defense.html'
        },
        culture: {
          en: 'https://www.canada.ca/en/services/culture.html',
          fr: 'https://www.canada.ca/fr/services/culture.html'
        },
        policing: {
          en: 'https://www.canada.ca/en/services/policing.html',
          fr: 'https://www.canada.ca/fr/services/police.html'
        },
        transport: {
          en: 'https://www.canada.ca/en/services/transport.html',
          fr: 'https://www.canada.ca/fr/services/transport.html'
        },
        finance: {
          en: 'https://www.canada.ca/en/services/finance.html',
          fr: 'https://www.canada.ca/fr/services/finance.html'
        },
        science: {
          en: 'https://www.canada.ca/en/services/science.html',
          fr: 'https://www.canada.ca/fr/services/science.html'
        },
        canada: {
          en: 'https://international.gc.ca/world-monde/index.aspx?lang=eng',
          fr: 'https://international.gc.ca/world-monde/index.aspx?lang=fra'
        }
      }
    }
  },
  methods: {
    hrefLang: function (langKey) {
      let lang = this.langShort(langKey)
      let langPath = lang + '_path'
      let href = this.WEB_SERVER[lang]
      if (this.isDeploymentServer) {
        href += this.APP_PATH[lang]
      }

      // Get lang2 route name
      if (Object.prototype.hasOwnProperty.call(this.$route.meta, langPath)) {
        href += '#' + this.$route.meta[langPath]
      }

      return href
    },
    routePath: function (langKey) {
      let lang = this.langShort(langKey)
      let langPath = lang + '_path'
      if (Object.prototype.hasOwnProperty.call(this.$route.meta, langPath)) {
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
      let src = '/'
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
