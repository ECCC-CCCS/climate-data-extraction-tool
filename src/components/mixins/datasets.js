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
          datasetGroup: 'station',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-adjusted-climate-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-climatiques-ajustees.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Adjusted and Homogenized Canadian Climate Data</a>.')
          }
        },
        normals: {
          title: this.$pgettext('Dataset Name', 'Climate normals 1981 - 2010'),
          abbr: null,
          datasetGroup: 'station',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-climate-normals.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-normales-climatiques.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Climate Normals</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Climate Normals</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        monthly: {
          title: this.$pgettext('Dataset Name', 'Monthly climate observation summaries'),
          abbr: null,
          datasetGroup: 'station',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-monthly-climate-summaries.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-sommaires-climatologiques-mensuels.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Monthly climate summaries</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/b24efb37-11b6-5d03-ab19-5759f83db546',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/b24efb37-11b6-5d03-ab19-5759f83db546',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Monthly climate summaries</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        daily: {
          title: this.$pgettext('Dataset Name', 'Daily climate observations'),
          abbr: null,
          datasetGroup: 'station',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-daily-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-quotidiennes.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Daily data</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/5f963c2d-d4ed-5a79-8a31-c9c582ca5098',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/5f963c2d-d4ed-5a79-8a31-c9c582ca5098',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Daily data</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        hydrometric: {
          title: this.$pgettext('Dataset Name', 'Historical Hydrometric Data'),
          abbr: null,
          datasetGroup: 'station',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-hydrometric-archive.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-archive-hydrometrique.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Historical hydrometric data</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/1ee9e14d-0814-5201-a3be-705809d8ee0e',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/1ee9e14d-0814-5201-a3be-705809d8ee0e',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Historical hydrometric data</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        cangrd: {
          title: this.$pgettext('Dataset Name', 'Gridded historical climate data'),
          abbr: this.$pgettext('Abbreviation: Gridded Historical Climate Data ', 'CANGRD'),
          datasetGroup: 'gridded',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-historical-climate-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-climatiques-historiques.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Gridded historical climate data</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/3d4b68a5-13bc-48bb-ad10-801128aa6604',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/3d4b68a5-13bc-48bb-ad10-801128aa6604',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Gridded historical climate data</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        cmip5: {
          title: this.$pgettext('Dataset Name', 'Global climate model scenarios'),
          abbr: this.$pgettext('Abbreviation: Global Climate Model Scenarios', 'CMIP5'),
          datasetGroup: 'model',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-coupled-model-intercomparison-phase5.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-phase5-intercomparaison-modeles-couples.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Coupled Model Intercomparison Project Phase 5 (CMIP5)</a>.')
          }
        },
        dcs: {
          title: this.$pgettext('Dataset Name', 'Statistically downscaled climate scenarios'),
          abbr: null,
          datasetGroup: 'model',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-downscaled-climate-scenarios.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-scenarios-climatiques-echelle-reduite.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">the technical documentation on the Statistically downscaled climate scenarios</a>.')
          }
        },
        rdpa: {
          title: this.$pgettext('Dataset Name', 'Regional deterministic precipitation analysis'),
          abbr: this.$pgettext('Abbreviation: Regional Deterministic Precipitation Analysis', 'RDPA'),
          datasetGroup: 'model',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-regional-precipitation-analysis.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-analyse-regionale-precipitations.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Regional Deterministic Precipitation Analysis</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/fdd3446a-dc20-5bad-9755-0855e3ec9b19',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/fdd3446a-dc20-5bad-9755-0855e3ec9b19',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Regional Deterministic Precipitation Analysis</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        cansips: {
          title: this.$pgettext('Dataset Name', 'Canadian seasonal to inter-annual prediction system'),
          abbr: this.$pgettext('Abbreviation: Canadian Seasonal to Inter-annual Prediction System', 'CanSIPS'),
          datasetGroup: 'model',
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-inter-annual-seasonal-prediction.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-prevision-interannuelle-saisonniere.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Canadian Seasonal to Inter-annual Prediction System</a>.')
          }
        }
      }
    },
    techDocHtml: function () {
      var techDocLink = this.datasetTitles[this.$route.name].techDoc[this.activeLocale]
      return this.datasetTitles[this.$route.name].techDoc.phrase.replace('{techDocLink}', techDocLink)
    },
    openPortalHtml: function () {
      var openPortalLink = this.datasetTitles[this.$route.name].openPortal[this.activeLocale]
      return this.datasetTitles[this.$route.name].openPortal.phrase.replace('{openPortalLink}', openPortalLink)
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
          use: this.$gettext('Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada\'s datasets.'),
          instructions: this.$gettext('You can specify the date ranges, variables, download format and other options. Use the map to select a geographic subset of the data. The geographic subset of the data that you download will match the area shown on the map. Download the data by clicking on the data download link at the bottom of the page.')
        },
        station: {
          instructions: this.$gettext('Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada\'s datasets. You can specify the date ranges, variables, download format and other options. Download the data by clicking on the data download link at the bottom of the page.'),
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
