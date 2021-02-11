/*
Anything common to dataset configurations
*/
export const datasets = {
  data () {
    return {
      supportDeskLink: {
        en: process.env.VUE_APP_SUPPORT_DESK_EN,
        fr: process.env.VUE_APP_SUPPORT_DESK_FR
      },
      climateLibraryLink: {
        en: process.env.VUE_APP_CLIMATE_LIBRARY_EN,
        fr: process.env.VUE_APP_CLIMATE_LIBRARY_FR
      },
      canadaDomain: {
        en: process.env.VUE_APP_CANADA_SERVER_EN,
        fr: process.env.VUE_APP_CANADA_SERVER_FR
      },
      climateDataLink: {
        en: 'https://climatedata.ca',
        fr: 'https://donneesclimatiques.ca'
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
          title: this.$pgettext('Dataset Name', 'Adjusted and Homogenized Canadian Climate Data'),
          abbr: this.$pgettext('Abbreviation: Adjusted and Homogenized Canadian Climate Data', 'AHCCD'),
          abbrName: this.$pgettext('Abbreviation definition for: AHCCD', 'Adjusted and Homogenized Canadian Climate Data'),
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-adjusted-climate-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-climatiques-ajustees.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on <abbr title="{datasetName}">AHCCD</abbr></a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/9c4ebc00-3ea4-4fe0-8bf2-66cfe1cddd1d',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/9c4ebc00-3ea4-4fe0-8bf2-66cfe1cddd1d',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for <abbr title="{datasetName}">AHCCD</abbr></a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        normals: {
          title: this.$pgettext('Dataset Name', 'Climate normals 1981 - 2010'),
          abbr: null,
          abbrName: null,
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-climate-normals.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-normales-climatiques.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Climate normals 1981-2010</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Climate normals 1981-2010</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        monthly: {
          title: this.$pgettext('Dataset Name', 'Monthly climate summaries'),
          abbr: null,
          abbrName: null,
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
          title: this.$pgettext('Dataset Name', 'Daily climate data'),
          abbr: null,
          abbrName: null,
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-daily-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-quotidiennes.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Daily climate data</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/5f963c2d-d4ed-5a79-8a31-c9c582ca5098',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/5f963c2d-d4ed-5a79-8a31-c9c582ca5098',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Daily climate data</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        ltce: {
          title: this.$pgettext('Dataset Name', 'Daily climate records'),
          abbr: this.$pgettext('Abbreviation: Long Term Climate Extremes', 'LTCE'),
          abbrName: this.$pgettext('Abbreviation definition for: LTCE', 'Long Term Climate Extremes'),
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-daily-climate-records.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-records-extremes-quotidiens.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on <abbr title="{datasetName}">LTCE</abbr></a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Daily climate records</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.'),
            phraseList: this.$gettext('The open government portal page for the Daily climate records also provides metadata files for the dataset as well as other avenues for accessing the dataset:'),
            variables: [{
              'name': this.$gettext('Daily extremes of record (LTCE) - Temperature'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/8a12c7f4-b9c9-54bc-a72a-2d59faed4cd3',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/8a12c7f4-b9c9-54bc-a72a-2d59faed4cd3'
              }
            }, {
              'name': this.$gettext('Daily extremes of record (LTCE) - Precipitation'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/341ae11e-e29d-5f8e-a504-c29b26450e7e',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/341ae11e-e29d-5f8e-a504-c29b26450e7e'
              }
            }, {
              'name': this.$gettext('Daily extremes of record (LTCE) - Snowfall'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/b6915a49-f101-571d-952a-375021062172',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/b6915a49-f101-571d-952a-375021062172'
              }
            }, {
              'name': this.$gettext('Long Term Climate Extremes, Virtual Climate Stations'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/746f9469-ab78-5dcc-b165-4b51e8ab8652'
              }
            }]
          }
        },
        hydrometric: {
          title: this.$pgettext('Dataset Name', 'Historical hydrometric data'),
          abbr: null,
          abbrName: null,
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
          title: this.$pgettext('Dataset Name', 'Canadian Gridded Temperature and Precipitation Anomalies'),
          abbr: this.$pgettext('Abbreviation: Canadian Gridded Temperature and Precipitation Anomalies', 'CANGRD'),
          abbrName: this.$pgettext('Abbreviation definition for: CANGRD', 'Canadian Gridded Temperature and Precipitation Anomalies'),
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-historical-climate-data.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-donnees-climatiques-historiques.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on <abbr title="{datasetName}">CANGRD</abbr></a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/3d4b68a5-13bc-48bb-ad10-801128aa6604',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/3d4b68a5-13bc-48bb-ad10-801128aa6604',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for <abbr title="{datasetName}">CANGRD</abbr></a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        cmip5: {
          title: this.$pgettext('Dataset Name', 'Global climate model scenarios'),
          abbr: null,
          abbrName: null,
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-coupled-model-intercomparison-phase5.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-phase5-intercomparaison-modeles-couples.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on the Global climate model scenarios</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/1e86f4f7-da88-403e-bd44-92065c0fd568',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/1e86f4f7-da88-403e-bd44-92065c0fd568',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Global climate model scenarios</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.'),
            phraseList: this.$gettext('The open government portal page for the Global climate model scenarios also provides metadata files for the dataset as well as other avenues for accessing the dataset:'),
            variables: [{
              'name': this.$gettext('Mean temperature'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/1e86f4f7-da88-403e-bd44-92065c0fd568',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/1e86f4f7-da88-403e-bd44-92065c0fd568'
              }
            }, {
              'name': this.$gettext('Mean precipitation'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/eddd6eaf-34d7-4452-a994-3d928115a68b',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/eddd6eaf-34d7-4452-a994-3d928115a68b'
              }
            }, {
              'name': this.$gettext('Snow depth'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/0933f0dc-3625-4583-828a-86d032e4b737',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/0933f0dc-3625-4583-828a-86d032e4b737'
              }
            }, {
              'name': this.$gettext('Sea ice thickness'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/b6a68b05-58f3-4d71-89d8-25b5a5277796',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/b6a68b05-58f3-4d71-89d8-25b5a5277796'
              }
            }, {
              'name': this.$gettext('Sea ice concentration'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/78f9e3e0-3a12-4321-99dd-eed047c31e5e',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/78f9e3e0-3a12-4321-99dd-eed047c31e5e'
              }
            }, {
              'name': this.$gettext('Surface wind speed'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/e0c71149-db7a-4700-acfd-1c8f9d778354',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/e0c71149-db7a-4700-acfd-1c8f9d778354'
              }
            }]
          }
        },
        dcs: {
          title: this.$pgettext('Dataset Name', 'Statistically downscaled climate scenarios'),
          abbr: null,
          abbrName: null,
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-downscaled-climate-scenarios.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-scenarios-climatiques-echelle-reduite.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">the technical documentation on the Statistically downscaled climate scenarios</a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/958b8357-3690-414d-8bec-d65951041636',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/958b8357-3690-414d-8bec-d65951041636',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for the Statistically downscaled climate scenarios</a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.'),
            phraseList: this.$gettext('The open government portal page for the Statistically downscaled climate scenarios also provides metadata files for the dataset as well as other avenues for accessing the dataset:'),
            variables: [{
              'name': this.$gettext('Mean temperature'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/958b8357-3690-414d-8bec-d65951041636',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/958b8357-3690-414d-8bec-d65951041636'
              }
            }, {
              'name': this.$gettext('Daily minimum temperature'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/3156e7bf-6f11-46f7-b70a-51b6d4e3835b',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/3156e7bf-6f11-46f7-b70a-51b6d4e3835b'
              }
            }, {
              'name': this.$gettext('Daily maximum temperature'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/57fee0af-40ec-4aad-89da-6c0d39a6424d',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/57fee0af-40ec-4aad-89da-6c0d39a6424d'
              }
            }, {
              'name': this.$gettext('Total precipitation'),
              'url': {
                'en': 'https://open.canada.ca/data/en/dataset/286dd106-b507-472a-9a26-f72dceffb475',
                'fr': 'https://ouvert.canada.ca/data/fr/dataset/286dd106-b507-472a-9a26-f72dceffb475'
              }
            }]
          }
        },
        rdpa: {
          title: this.$pgettext('Dataset Name', 'Regional Deterministic Precipitation Analysis'),
          abbr: this.$pgettext('Abbreviation: Regional Deterministic Precipitation Analysis', 'RDPA'),
          abbrName: this.$pgettext('Abbreviation definition for: RDPA', 'Regional Deterministic Precipitation Analysis'),
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-regional-precipitation-analysis.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-analyse-regionale-precipitations.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on <abbr title="{datasetName}">RDPA</abbr></a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/fdd3446a-dc20-5bad-9755-0855e3ec9b19',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/fdd3446a-dc20-5bad-9755-0855e3ec9b19',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for <abbr title="{datasetName}">RDPA</abbr></a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        },
        cansips: {
          title: this.$pgettext('Dataset Name', 'Canadian Seasonal to Inter-annual Prediction System'),
          abbr: this.$pgettext('Abbreviation: Canadian Seasonal to Inter-annual Prediction System', 'CanSIPS'),
          abbrName: this.$pgettext('Abbreviatio definition for: CanSIPS', 'Canadian Seasonal to Inter-annual Prediction System'),
          techDoc: {
            en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/technical-documentation-inter-annual-seasonal-prediction.html',
            fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/documentation-technique-prevision-interannuelle-saisonniere.html',
            phrase: this.$gettext('For more detailed information on this dataset, see the <a href="{techDocLink}" target="_blank">technical documentation on <abbr title="{datasetName}">CanSIPS</abbr></a>.')
          },
          openPortal: {
            en: 'https://open.canada.ca/data/en/dataset/922781a9-bfef-56b9-a438-493ada629d47',
            fr: 'https://ouvert.canada.ca/data/fr/dataset/922781a9-bfef-56b9-a438-493ada629d47',
            phrase: this.$gettext('The <a href="{openPortalLink}" target="_blank">open government portal page for <abbr title="{datasetName}">CanSIPS</abbr></a> also provides metadata files for the dataset as well as other avenues for accessing the dataset.')
          }
        }
      }
    },
    techDocHtml: function () {
      let techDocLink = this.datasetTitles[this.$route.name].techDoc[this.activeLocale]
      let htmlPhrase = this.datasetTitles[this.$route.name].techDoc.phrase
      htmlPhrase = htmlPhrase.replace('{techDocLink}', techDocLink)
      htmlPhrase = htmlPhrase.replace('{datasetName}', this.currentRouteTitle)
      return htmlPhrase
    },
    openPortalHtml: function () {
      let openPortalLink = this.datasetTitles[this.$route.name].openPortal[this.activeLocale]
      let htmlPhrase = this.datasetTitles[this.$route.name].openPortal.phrase
      htmlPhrase = htmlPhrase.replace('{openPortalLink}', openPortalLink)
      htmlPhrase = htmlPhrase.replace('{datasetName}', this.currentRouteTitle)
      return htmlPhrase
    },
    openPortalListHtml: function () {
      return this.datasetTitles[this.$route.name].openPortal.phraseList
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
            fr: this.canadaDomain.fr + '/services/environnement.html'
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
      let currentRouteName = this.$route.name
      if (Object.prototype.hasOwnProperty.call(this.datasetTitles, currentRouteName)) {
        return this.datasetTitles[currentRouteName].title
      } else {
        return ''
      }
    },
    currentRouteAbbr: function () {
      let currentRouteName = this.$route.name
      if (Object.prototype.hasOwnProperty.call(this.datasetTitles, currentRouteName)) {
        return this.datasetTitles[currentRouteName].abbr
      } else {
        return ''
      }
    },
    currentRouteShortTitle: function () {
      let currentRouteName = this.$route.name
      if (Object.prototype.hasOwnProperty.call(this.datasetTitles, currentRouteName)) {
        if (Object.prototype.hasOwnProperty.call(this.datasetTitles[currentRouteName], 'abbr')) {
          return this.datasetTitles[currentRouteName].abbr
        } else {
          return null
        }
      } else {
        return null
      }
    },
    currentLangPath: function () {
      let currentLang = this.$i18n.activeLocale
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
        text: this.$gettext('Visit <a href="{link}" target="_blank">ClimateData.ca</a> if you\'d like data for a single grid point only'),
        link: this.climateDataLink
      }
    }
  }
}
