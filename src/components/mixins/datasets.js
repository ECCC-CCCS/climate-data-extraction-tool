/*
Anything common to dataset configurations
*/
export const datasets = {
  data () {
    return {
      supportDeskLink: {
        en: process.env.SUPPORT_DESK_EN,
        fr: process.env.SUPPORT_DESK_FR
      },
      climateLibraryLink: {
        en: process.env.CLIMATE_LIBRARY_EN,
        fr: process.env.CLIMATE_LIBRARY_FR
      },
      canadaDomain: {
        en: process.env.CANADA_SERVER_EN,
        fr: process.env.CANADA_SERVER_FR
      }
    }
  },
  computed: {
    datasetTitles: function () {
      return {
        home: {
          title: this.$pgettext('Title', 'Climate data extraction tool')
        },
        ahccd: {
          title: this.$pgettext('Dataset Name', 'Adjusted and homogenized Canadian climate data'),
          abbr: this.$pgettext('Abbreviation: Adjusted and Homogenized Canadian Climate Data', 'AHCCD'),
          datasetGroup: 'station'
        },
        normals: {
          title: this.$pgettext('Dataset Name', 'Climate normals 1981 - 2010'),
          abbr: null,
          datasetGroup: 'station'
        },
        monthly: {
          title: this.$pgettext('Dataset Name', 'Monthly climate observation summaries'),
          abbr: null,
          datasetGroup: 'station'
        },
        daily: {
          title: this.$pgettext('Dataset Name', 'Daily climate observations'),
          abbr: null,
          datasetGroup: 'station'
        },
        hydrometric: {
          title: this.$pgettext('Dataset Name', 'Historical Hydrometric Data'),
          abbr: null,
          datasetGroup: 'station'
        },
        cangrd: {
          title: this.$pgettext('Dataset Name', 'Gridded historical climate data'),
          abbr: this.$pgettext('Abbreviation: Gridded Historical Climate Data ', 'CANGRD'),
          datasetGroup: 'gridded'
        },
        cmip5: {
          title: this.$pgettext('Dataset Name', 'Global climate model scenarios'),
          abbr: this.$pgettext('Abbreviation: Global Climate Model Scenarios', 'CMIP5'),
          datasetGroup: 'model'
        },
        dcs: {
          title: this.$pgettext('Dataset Name', 'Statistically downscaled climate scenarios'),
          abbr: null,
          datasetGroup: 'model'
        },
        capa: {
          title: this.$pgettext('Dataset Name', 'Regional deterministic precipitation analysis'),
          abbr: this.$pgettext('Abbreviation: Regional Deterministic Precipitation Analysis', 'RDPA'),
          datasetGroup: 'model'
        },
        cansips: {
          title: this.$pgettext('Dataset Name', 'Canadian seasonal to inter-annual prediction system'),
          abbr: this.$pgettext('Abbreviation: Canadian Seasonal to Inter-annual Prediction System', 'CanSIPS'),
          datasetGroup: 'model'
        }
      }
    },
    climateLinks: function () {
      return {
        canada: {
          title: this.$pgettext('Breadcrumb', 'Home'),
          url: {
            en: this.canadaDomain.en + '.html',
            fr: this.canadaDomain.fr + '.html'
          }
        },
        enr: {
          title: this.$gettext('Environment and natural resources'),
          url: {
            en: this.canadaDomain.en + '/services/environment.html',
            fr: this.canadaDomain.fr + '/services/environnement'
          }
        },
        weatherClimateHazards: {
          title: this.$gettext('Weather, climate and hazards'),
          url: {
            en: this.canadaDomain.en + '/services/environment/weather.html',
            fr: this.canadaDomain.fr + '/services/environnement/meteo.html'
          }
        },
        climateChange: {
          title: this.$gettext('Climate change'),
          url: {
            en: this.canadaDomain.en + '/services/environment/weather/climatechange.html',
            fr: this.canadaDomain.fr + '/services/environnement/meteo/changementsclimatiques.html'
          }
        },
        climateAdapt: {
          title: this.$gettext('Adapting to Climate Change'),
          url: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/adapting.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/adapter.html'
          }
        },
        climateServices: {
          title: this.$gettext('Canadian Centre for Climate Services'),
          url: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques.html'
          }
        },
        climateDisplay: {
          title: this.$gettext('Display and Download Climate Data'),
          url: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger.html'
          }
        }
      }
    },
    currentRouteTitle: function () {
      var currentRouteName = this.$route.name
      if (this.datasetTitles.hasOwnProperty(currentRouteName)) {
        return this.datasetTitles[currentRouteName].title
      } else {
        return ''
      }
    },
    currentRouteAbbr: function () {
      var currentRouteName = this.$route.name
      if (this.datasetTitles.hasOwnProperty(currentRouteName)) {
        return this.datasetTitles[currentRouteName].abbr
      } else {
        return ''
      }
    },
    currentRouteShortTitle: function () {
      var currentRouteName = this.$route.name
      if (this.datasetTitles.hasOwnProperty(currentRouteName)) {
        if (this.datasetTitles[currentRouteName].hasOwnProperty('abbr')) {
          return this.datasetTitles[currentRouteName].abbr
        } else {
          return null
        }
      } else {
        return null
      }
    },
    currentLangPath: function () {
      var currentLang = this.$i18n.activeLocale
      return currentLang + '_path'
    },
    activeLocale: function () {
      return this.$i18n.activeLocale
    },
    activeLocale3: function () {
      if (this.$i18n.activeLocale === 'fr') {
        return 'fra'
      } else {
        return 'eng'
      }
    },
    supportDeskUrl: function () {
      return this.supportDeskLink[this.activeLocale]
    },
    climateLibraryUrl: function () {
      return this.climateLibraryLink[this.activeLocale]
    },
    introDatasetText: function () {
      return {
        gridded: {
          use: this.$gettext('Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada\' datasets.'),
          instructions: this.$gettext('You can specify the date ranges, variables, download format and other options. Use the map to select a geographic subset of the data. The geographic subset of the data that you download will match the area shown on the map. Download the data by clicking on the data download link at the bottom of the page.')
        },
        station: {
          instructions: this.$gettext('Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada\' datasets. You can specify the date ranges, variables, download format and other options. Download the data by clicking on the data download link at the bottom of the page.'),
          tipTitle: this.$gettext('Tips for using the tool'),
          tipPoints: [
            this.$gettext('select stations on the map or in the table by clicking on them'),
            this.$gettext('to see only selected stations in the table, click the "Show selected" button'),
            this.$gettext('deselect a station by clicking on it again in the table'),
            this.$gettext('deselect all stations by clicking the "Clear selected" button'),
            this.$gettext('only 20 stations can be selected at once'),
            this.$gettext('alternatively, for most datasets, you can select all stations within a province or territory with the "Province/Territory" menu')
          ]
        },
        info: {
          supportDesk: '',
          climateLibrary: ''
        }
      }
    },
    infoSupportDeskGridPoint: function () {
      return {
        text: this.$gettext('<a href="{link}" target="_blank">Contact the Climate Services Support Desk</a> if you\'d like data for a single grid point only'),
        link: this.supportDeskLink
      }
    }
  }
}
