/*
Anything common to CMIP5 and DCS configurations with OGC API Coverage
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
      oapicIdVariable: 'TT',
      oapicScenario: 'RCP2.6',
      oapicIdTimePeriod: 'annual',
      ows_bbox: '-154,38,-49,81',
      lastSelectedRCP: 'projected',
      scenarioType: 'projected',
      valueType: 'anomaly',
      rangeType: 'P20Y-Avg',
      avg20Year: '2081-2100',
      percentile: '50',
      percentileLink: {
        en: process.env.VUE_APP_CANADA_SERVER_EN + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/basics/scenario-models.html#toc2',
        fr: process.env.VUE_APP_CANADA_SERVER_FR + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/essentiels/scenarios-modeles.html#toc2'
      }
    }
  },
  watch: {
    scenarioType: function (newVal) {
      // remember last selected RCP if any
      if (this.oapicScenario.includes('RCP')) {
        this.lastSelectedRCP = this.oapicScenario
      }

      // adjust oapicScenario selection for History or Future
      if (newVal === 'historical') {
        this.oapicScenario = newVal
        this.rangeType = 'custom'

        // Autocorrect histStart date for DCS if out of range
        if (this.oapic_id_dataset === 'DCS') {
          let histStart = this.$moment.utc(this.dateHistStart, this.dateConfigs.format)
          if (histStart.isBefore(this.dateConfigs.dateMin) || histStart.isAfter(this.dateConfigs.dateMax)) {
            this.dateHistStart = this.$moment.utc(this.dateConfigs.dateMin).toDate()
          }
        }
      } else {
        this.oapicScenario = this.lastSelectedRCP
      }
    },
    oapicIdTimePeriod: function (newVal) {
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'ENS') {
        this.valueType = 'absolute'
        this.rangeType = 'custom'
      }
      // adjust dates if they are strings to match new date format
      this.dateRcpStart = this.formatDateToMoment(this.dateRcpStart).format(this.dateConfigs.format)
      this.dateRcpEnd = this.formatDateToMoment(this.dateRcpEnd).format(this.dateConfigs.format)
    },
    valueType: function (newVal) {
      if (newVal === 'absolute') {
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
      if (this.scenarioType === 'projected') {
        this.dateRcpStart = null
        this.dateRcpEnd = null
      } else {
        this.dateHistStart = null
        this.dateHistEnd = null
      }
    }
  },
  computed: {
    oapicCoverageId: function () {
      return 'climate:' + this.oapic_id_dataset + ':' + this.scenarioType + ':' + this.timePeriodType + ':' + this.oapicValueType
    },
    oapicBand: function () {
      if (this.rangeType === 'P20Y-Avg') {
        return null
      } else if (this.scenarioType === 'historical') {
        return this.bandRangeFormat(this.bandDatesFormatted.histStart, this.bandDatesFormatted.histEnd)
      } else { // scenarioType === projected
        return this.bandRangeFormat(this.bandDatesFormatted.rcpStart, this.bandDatesFormatted.rcpEnd)
      }
    },
    oapicValueType: function() {
      if (this.rangeType === 'P20Y-Avg') {
        return this.rangeType
      } else {
        return this.valueType
      }
    },
    valueTypeOptions: function () {
      if (this.oapicIdTimePeriod === 'ENS') {
        return { // monthly ensembles are absolute only
          absolute: this.$gettext('Actual values')
        }
      } else {
        return {
          anomaly: this.$gettext('Anomaly values'),
          absolute: this.$gettext('Actual values')
        }
      }
    },
    rangeTypeOptions: function () {
      if (this.scenarioType === 'historical') {
        return {
          'custom': this.$gettext('User defined range')
        }
      } else if (this.oapicIdTimePeriod === 'ENS' || this.valueType === 'ABS') {
        return {
          'custom': this.$gettext('User defined range')
        }
      } else {
        return {
          'P20Y-Avg': this.$gettext('20-Year average'),
          'custom': this.$gettext('User defined range')
        }
      }
    },
    scenarioOptions: function () {
      return {
        'RCP2.6': this.$gettext('Low emissions scenario (RCP 2.6)'),
        'RCP4.5': this.$gettext('Moderate emissions scenario (RCP 4.5)'),
        'RCP8.5': this.$gettext('High emissions scenario (RCP 8.5)')
      }
    },
    timePeriodOptions: function () {
      let options = {
        SPRING: this.$gettext('Spring (March-May)'),
        SUMMER: this.$gettext('Summer (June-August)'),
        FALL: this.$gettext('Fall (September-November)'),
        WINTER: this.$gettext('Winter (December-February)'),
        YEAR: this.$gettext('Annual'),
        ENS: this.$gettext('Monthly')
      }
      return options
    },
    timePeriodType: function () {
      if (this.oapicIdTimePeriod === 'YEAR') {
        return 'annual'
      } else if (this.oapicIdTimePeriod === 'ENS') {
        return 'monthly'
      } else {
        return 'seasonal'
      }
    },
    scenarioTypeOptions: function () {
      return {
        projected: this.$gettext('Future'),
        historical: this.$gettext('Historical')
      }
    },
    dateHistMin: function () {
      if (this.oapic_id_dataset === 'DCS' && this.scenarioType === 'historical') {
        return this.$moment.utc('1951-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    dateHistMax: function () {
      return this.$moment.utc('2005-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
    },
    dateConfigs: function () {
      let dateMin = this.scenarioType === 'projected' ? this.dateRcpMin : this.dateHistMin
      let dateMax = this.scenarioType === 'projected' ? this.dateRcpMax : this.dateHistMax
      if (this.oapicIdTimePeriod === 'ENS') {
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
      if (this.scenarioType === 'projected') {
        return this.datesInRange(this.bandMoments.rcpStart, this.bandMoments.rcpEnd)
      } else { // history
        return this.datesInRange(this.bandMoments.histStart, this.bandMoments.histEnd)
      }
    },
    bandStartIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
        return this.dateStartIsEmptyOnly(this.dateRcpStart, this.dateRcpEnd)
      } else { // history
        return this.dateStartIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandEndIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
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
    dateStartMoment: function () {
      if (this.scenarioType === 'projected') {
        return this.$moment.utc(this.bandMoments.rcpStart)
      } else {
        return this.$moment.utc(this.bandMoments.histStart)
      }
    },
    dateEndMoment: function () {
      if (this.scenarioType === 'projected') {
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
      let start = this.scenarioType === 'historical' ? this.bandMoments.histStart : this.bandMoments.rcpStart
      let end = this.scenarioType === 'historical' ? this.bandMoments.histEnd : this.bandMoments.rcpEnd

      if (start === null || end === null) {
        return false
      }

      let minimumView = this.dateConfigs.minimumView

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
      if (this.rangeType === 'P20Y-Avg') { // no date range checks for 20-year averages
        return false
      } else {
        return this.hasCommonBandErrors
      }
    },
    dateRangeNumBands: function () { // count number of years/months in given date range
      let start = this.scenarioType === 'historical' ? this.bandMoments.histStart : this.bandMoments.rcpStart
      let end = this.scenarioType === 'historical' ? this.bandMoments.histEnd : this.bandMoments.rcpEnd

      return this.calcDateRangeNumBands(start, end)
    }
  }
}
