/*
Anything common to CMIP5 and DCS configurations
*/
export const DCSCMIP5 = {
  data () {
    return {
      dateRcpStart: this.$moment.utc('2006-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateRcpEnd: this.$moment.utc('2100-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateRcpMin: this.$moment.utc('2006-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateRcpMax: this.$moment.utc('2100-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistStart: this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistEnd: this.$moment.utc('2005-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      wcs_id_variable: 'TT',
      wcs_id_scenario: 'RCP26',
      wcs_id_timePeriod: 'YEAR',
      ows_bbox: '-154,38,-49,81',
      lastSelectedRCP: 'RCP',
      scenarioType: 'RCP',
      valueType: 'ANO',
      rangeType: 'year20',
      avg20Year: '2081-2100',
      percentile: 'PCTL50',
      percentileLink: {
        en: process.env.CANADA_SERVER_EN + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/basics/scenario-models.html#toc2',
        fr: process.env.CANADA_SERVER_FR + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/essentiels/scenarios-modeles.html#toc2'
      }
    }
  },
  watch: {
    scenarioType: function (newVal) {
      // remember last selected RCP if any
      if (this.wcs_id_scenario.includes('RCP')) {
        this.lastSelectedRCP = this.wcs_id_scenario
      }

      // adjust wcs_id_scenario selection for History or Future
      if (newVal === 'HISTO') {
        this.wcs_id_scenario = newVal
        this.rangeType = 'custom'

        // Autocorrect histStart date for DCS if out of range
        if (this.wcs_id_dataset === 'DCS') {
          var histStart = this.$moment.utc(this.dateHistStart, this.dateConfigs.format)
          if (histStart.isBefore(this.dateConfigs.dateMin) || histStart.isAfter(this.dateConfigs.dateMax)) {
            this.dateHistStart = this.$moment.utc(this.dateConfigs.dateMin).toDate()
          }
        }
      } else {
        this.wcs_id_scenario = this.lastSelectedRCP
      }
    },
    wcs_id_timePeriod: function (newVal) {
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'ENS') {
        this.valueType = 'ABS'
        this.rangeType = 'custom'
      }
      // adjust dates if they are strings to match new date format
      this.dateRcpStart = this.formatDateToMoment(this.dateRcpStart).format(this.dateConfigs.format)
      this.dateRcpEnd = this.formatDateToMoment(this.dateRcpEnd).format(this.dateConfigs.format)
    },
    valueType: function (newVal) {
      if (newVal === 'ABS') {
        this.rangeType = 'custom'
      }
    }
  },
  methods: {
    dateIsString: function (date) {
      return typeof date === 'string'
    },
    formatDateToMoment: function (date) {
      if (date === 'Invalid date' || date === '' || date === null) {
        return null // invalid dates
      }
      return this.dateIsString(date) ? this.$moment.utc(date, this.dateConfigs.format) : this.$moment.utc(date)
    },
    clearDates: function () {
      if (this.scenarioType === 'RCP') {
        this.dateRcpStart = null
        this.dateRcpEnd = null
      } else {
        this.dateHistStart = null
        this.dateHistEnd = null
      }
    }
  },
  computed: {
    wcs_coverage_id: function () {
      return this.wcs_id_dataset + '.' + this.wcs_id_variable + '.' + this.wcs_id_scenario + '.' + this.wcs_id_timePeriod + '.' + this.wcs_id_percentile
    },
    wcs_id_percentile: function () {
      if (this.rangeType === 'year20' && this.valueType === 'ANO') {
        return this.avg20Year + '_' + this.percentile
      } else {
        return this.valueType + '_' + this.percentile
      }
    },
    wcs_band: function () {
      if (this.rangeType === 'year20') {
        return null
      } else if (this.scenarioType === 'HISTO') {
        return this.bandRangeFormat(this.bandDatesFormatted.histStart, this.bandDatesFormatted.histEnd)
      } else { // scenarioType === RCP
        return this.bandRangeFormat(this.bandDatesFormatted.rcpStart, this.bandDatesFormatted.rcpEnd)
      }
    },
    valueTypeOptions: function () {
      if (this.wcs_id_timePeriod === 'ENS') {
        return { // monthly ensembles are absolute only
          ABS: this.$gettext('Actual values')
        }
      } else {
        return {
          ANO: this.$gettext('Anomaly values'),
          ABS: this.$gettext('Actual values')
        }
      }
    },
    rangeTypeOptions: function () {
      if (this.scenarioType === 'HISTO') {
        return {
          'custom': this.$gettext('User defined range')
        }
      } else if (this.wcs_id_timePeriod === 'ENS' || this.valueType === 'ABS') {
        return {
          'custom': this.$gettext('User defined range')
        }
      } else {
        return {
          'year20': this.$gettext('20-Year average'),
          'custom': this.$gettext('User defined range')
        }
      }
    },
    scenarioOptions: function () {
      return {
        RCP26: this.$gettext('Low emissions scenario (RCP 2.6)'),
        RCP45: this.$gettext('Moderate emissions scenario (RCP 4.5)'),
        RCP85: this.$gettext('High emissions scenario (RCP 8.5)')
      }
    },
    timePeriodOptions: function () {
      var options = {
        SPRING: this.$gettext('Spring (March-May)'),
        SUMMER: this.$gettext('Summer (June-August)'),
        FALL: this.$gettext('Fall (September-November)'),
        WINTER: this.$gettext('Winter (December-February)'),
        YEAR: this.$gettext('Annual'),
        ENS: this.$gettext('Monthly')
      }
      // if (!this.pointDownloadOn) {
      //   options['ENS'] = this.$gettext('Monthly')
      // }
      return options
    },
    scenarioTypeOptions: function () {
      return {
        RCP: this.$gettext('Future'),
        HISTO: this.$gettext('Historical')
      }
    },
    dateHistMin: function () {
      if (this.wcs_id_dataset === 'DCS' && this.scenarioType === 'HISTO') {
        return this.$moment.utc('1951-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    dateHistMax: function () {
      return this.$moment.utc('2005-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
    },
    dateConfigs: function () {
      var dateMin = this.scenarioType === 'RCP' ? this.dateRcpMin : this.dateHistMin
      var dateMax = this.scenarioType === 'RCP' ? this.dateRcpMax : this.dateHistMax
      if (this.wcs_id_timePeriod === 'ENS') {
        return {
          minimumView: 'month',
          format: 'YYYY-MM',
          placeholder: 'YYYY-MM',
          dateMin: dateMin,
          dateMax: dateMax
        }
      } else {
        return {
          minimumView: 'year',
          format: 'YYYY',
          placeholder: 'YYYY',
          dateMin: dateMin,
          dateMax: dateMax
        }
      }
    },
    bandsInRange: function () {
      if (this.scenarioType === 'RCP') {
        return this.datesInRange(this.bandMoments.rcpStart, this.bandMoments.rcpEnd)
      } else { // history
        return this.datesInRange(this.bandMoments.histStart, this.bandMoments.histEnd)
      }
    },
    bandStartIsEmptyOnly: function () {
      if (this.scenarioType === 'RCP') {
        return this.dateStartIsEmptyOnly(this.dateRcpStart, this.dateRcpEnd)
      } else { // history
        return this.dateStartIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandEndIsEmptyOnly: function () {
      if (this.scenarioType === 'RCP') {
        return this.dateEndIsEmptyOnly(this.dateRcpStart, this.dateRcpEnd)
      } else { // history
        return this.dateEndIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandMoments: function () {
      return {
        rcpStart: this.formatDateToMoment(this.dateRcpStart),
        rcpEnd: this.formatDateToMoment(this.dateRcpEnd),
        histStart: this.formatDateToMoment(this.dateHistStart),
        histEnd: this.formatDateToMoment(this.dateHistEnd)
      }
    },
    bandStartMoment: function () { // used for chunkedBandsParam
      if (this.scenarioType === 'RCP') {
        return this.$moment.utc(this.bandMoments.rcpStart)
      } else {
        return this.$moment.utc(this.bandMoments.histStart)
      }
    },
    bandEndMoment: function () { // used for chunkedBandsParam
      if (this.scenarioType === 'RCP') {
        return this.$moment.utc(this.bandMoments.rcpEnd)
      } else {
        return this.$moment.utc(this.bandMoments.histEnd)
      }
    },
    bandDatesFormatted: function () {
      return {
        rcpStart: this.bandMoments.rcpStart === null ? null : this.bandMoments.rcpStart.format(this.dateConfigs.format),
        rcpEnd: this.bandMoments.rcpEnd === null ? null : this.bandMoments.rcpEnd.format(this.dateConfigs.format),
        histStart: this.bandMoments.histStart === null ? null : this.bandMoments.histStart.format(this.dateConfigs.format),
        histEnd: this.bandMoments.histEnd === null ? null : this.bandMoments.histEnd.format(this.dateConfigs.format)
      }
    },
    bandsPastLimits: function () {
      var start = this.scenarioType === 'HISTO' ? this.bandMoments.histStart : this.bandMoments.rcpStart
      var end = this.scenarioType === 'HISTO' ? this.bandMoments.histEnd : this.bandMoments.rcpEnd

      if (start === null || end === null) {
        return false
      }

      var minimumView = this.dateConfigs.minimumView

      return start.isBefore(this.dateConfigs.dateMin, minimumView) ||
        start.isAfter(this.dateConfigs.dateMax, minimumView) ||
        end.isBefore(this.dateConfigs.dateMin, minimumView) ||
        end.isAfter(this.dateConfigs.dateMax, minimumView)
    },
    infoPercentile: function () {
      return {
        text: this.$gettext('<a href="{link}" target="_blank">Learn more about percentiles</a>'),
        link: this.percentileLink
      }
    },
    infoSupportDeskModelOutput: function () {
      return {
        text: this.$gettext('<a href="{link}" target="_blank">Contact the Climate Services Support Desk</a> if you\'re interested in individual model output'),
        link: this.supportDeskLink
      }
    },
    infoModelOutput: function () {
      return {
        text: this.$gettext('Visit <a href="{link}" target="_blank">ClimateData.ca</a> to access individual model output'),
        link: this.climateDataLink
      }
    },
    infoDailyData: function () {
      return {
        // text: this.$gettext('<a href="{link}" target="_blank">Contact the Climate Services Support Desk</a> if you\'re interested in daily data'),
        text: this.$gettext('Visit <a href="{link}" target="_blank">ClimateData.ca</a> to access daily data'),
        link: this.climateDataLink
      }
    },
    hasErrors: function () {
      if (this.rangeType === 'year20') { // no date range checks for 20-year averages
        return false
      } else {
        return this.hasCommonBandErrors
      }
    },
    dateRangeNumBands: function () {
      var start = this.scenarioType === 'HISTO' ? this.bandMoments.histStart : this.bandMoments.rcpStart
      var end = this.scenarioType === 'HISTO' ? this.bandMoments.histEnd : this.bandMoments.rcpEnd

      return this.calcDateRangeNumBands(start, end)
    }
  }
}
