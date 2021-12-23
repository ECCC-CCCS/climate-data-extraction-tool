/*
Anything default/common to OGC API Coverage querying goes here
*/
export const oapiCoverage = {
  data () {
    return {
      oapicServer: process.env.VUE_APP_OPENAPI_SERVER,
      oapicPath: '/collections',
      oapicFormat: 'NetCDF',
      oapic_width: '',
      oapic_height: '',
      oapic_id: 'ABCDEFG',
      date_start: '',
      date_end: ''
    }
  },
  computed: {
    selectedCoverageIdOption: function () {
      let wcsCoverage = {}
      wcsCoverage[this.oapicCoverageId] = this.currentRouteTitle
      return wcsCoverage
    },
    timePeriodIsMonthly: function () {
      // MONTHLY for CanGRD; monthly for DCS/CMIP5
      return (this.oapicIdTimePeriod === 'MONTHLY' || this.oapicIdTimePeriod === 'monthly')
    },
    bandsEmptyOnMonthly: function () {
      let startDate = this.$moment.utc(this.dateStartMoment).format(this.dateConfigs.format)
      let endDate = this.$moment.utc(this.dateEndMoment).format(this.dateConfigs.format)
      return (startDate === 'Invalid date' && endDate === 'Invalid date' && this.timePeriodIsMonthly)
    },
    dateRangeParams: function () {
      if (this.hasCommonBandErrors) { // range 0 or errors
        return []
      } else if (this.usesBands) {
        return [{
          'start': this.dateStartMoment.format(this.dateConfigs.format),
          'end': this.dateEndMoment.format(this.dateConfigs.format),
          'duration': 0,
          'specialTitle': this.rangeTypeOptions[this.rangeType]
        }]
      } else { // no bands (empty)
        if (this.oapicIdDataset === 'CANGRD' && this.oapic_id_cangrdType === 'TREND') {
          // CanGRD trends special title
          return [{
            'start': null,
            'end': null,
            'duration': 0,
            'specialTitle': this.variableTypeOptions[this.oapic_id_cangrdType]
          }]
        } else if (this.rangeType === 'P20Y-Avg' && (this.oapicIdDataset === 'DCS' || this.oapicIdDataset === 'CMIP5')) {
          // DCS or CMIP5 20-year average special title
          return [{
            'start': null,
            'end': null,
            'duration': 0,
            'specialTitle': this.rangeTypeOptions[this.rangeType]
          }]
        }

        // default
        return [{
          'start': null,
          'end': null,
          'duration': 0
        }]
      }
    },
    usesBands: function () {
      return (this.oapicBand !== null && this.oapicBand !== 'Invalid date')
    },
    dateRangeErrorMessage: function () {
      if (this.bandStartIsEmptyOnly || this.bandEndIsEmptyOnly) {
        return this.$gettext('Date range fields must be all set or cleared.')
      }
      if (!this.bandsInRange) {
        return this.$gettext('The start date cannot be greater than the end date.')
      }
      if (this.bandsEmptyOnMonthly) { // WCS download limitation: bands < 255
        return this.$gettext('This field is required for monthly time intervals.')
      }
      return '' // no errors
    },
    hasCommonBandErrors: function () {
      return this.bandStartIsEmptyOnly ||
        this.bandEndIsEmptyOnly ||
        !this.bandsInRange ||
        this.bandsPastLimits ||
        this.bandsEmptyOnMonthly
    },
    oapicUrl: function () {
      let url = this.oapicServer + this.oapicPath + '/' + this.oapicCoverageId + '/coverage?'
      url += this.getOapicCommonParams().join('&')
      return url
    }
  },
  methods: {
    bandRangeFormat: function (bandStart, bandEnd) {
      // Check for null and append "B"
      if (bandStart === null || bandEnd === null || bandStart === 'Invalid date' || bandEnd === 'Invalid date' || typeof bandStart === 'undefined' || typeof bandEnd === 'undefined') {
        return null
      } else if (bandStart === bandEnd) { // single date
        return 'B' + bandStart
      } else { // date range
        return 'B' + bandStart + ':B' + bandEnd
      }
    },
    getOapicCommonParams: function () {
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      urlParams.push(`range-subset=${this.oapicIdVariable}`)

      // subset
      let subset = []
      if (this.rangeType === 'P20Y-Avg' && this.valueType === 'anomaly') {
        subset.push(`subset=P20Y-Avg("${this.avg20Year}")`)
      } else {
        subset.push(`subset=percentile(${this.percentile})`)
      }
      // subset: scenario
      if (this.scenarioType === 'projected') {
        subset.push(`scenario("${this.oapicScenario}")`)
      }
      // subset: seasonal
      if (this.timePeriodType === 'seasonal') {
        subset.push(`season("${this.oapicIdTimePeriod}")`)
      }
      urlParams.push(subset.join(','))

      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x.toFixed(3)},${this.bbox_parts.min_y.toFixed(3)},${this.bbox_parts.max_x.toFixed(3)},${this.bbox_parts.max_y.toFixed(3)}`)

      // datetime
      if (this.rangeType !== 'P20Y-Avg') {
        urlParams.push(`datetime=${this.dateStartMoment.format(this.dateConfigs.format)}/${this.dateEndMoment.format(this.dateConfigs.format)}`)
      }
      console.info(urlParams)
      return urlParams
    },
    oapicUrlFormatter: function () {
      let url = this.oapicServer + this.oapicPath
      let urlParams = this.getOapicCommonParams()

      url += urlParams.join('&')
      return url
    },
    clearDates: function () {
      this.date_start = null
      this.date_end = null
    },
    dateStartIsEmptyOnly: function (dateStart, dateEnd) {
      if (dateStart === 'Invalid date' && dateEnd !== 'Invalid date') {
        return true
      } else {
        return false
      }
    },
    dateEndIsEmptyOnly: function (dateStart, dateEnd) {
      if (dateStart !== 'Invalid date' && dateEnd === 'Invalid date') {
        return true
      } else {
        return false
      }
    },
    datesInRange: function (dateStart, dateEnd) {
      if (dateStart === 'Invalid date' || dateEnd === 'Invalid date') {
        return true
      } else if (dateStart > dateEnd) {
        return false
      } else {
        return true
      }
    },
    calcDateRangeNumBands: function (start, end) {
      // Determine number of months/years (bands) in a given date range
      if (start === null || end === null) {
        return 0
      } else if (this.timePeriodIsMonthly && this.bandsInRange) {
        // MONTHLY for CanGRD; monthly for DCS/CMIP5
        return Math.ceil(this.$moment.duration(end.diff(start)).asMonths()) + 1 // +1 for range is inclusive
      } else if (this.bandsInRange) { // yearly date range
        return Math.ceil(this.$moment.duration(end.diff(start)).asYears())
      } else {
        return 0
      }
    }
  }
}
