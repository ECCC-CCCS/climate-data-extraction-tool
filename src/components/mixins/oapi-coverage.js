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
    filename: function () {
      return this.oapicCoverageId
    },
    fileFormats: function () {
      return {
        json: this.$pgettext('File format', 'CoverageJSON'),
        GRIB: this.$pgettext('File format','GRIB')
      }
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
    usesBands: function () {
      return (this.oapicBand !== null && this.oapicBand !== 'Invalid date')
    },
    dateStartEmpty: function () {
      return this.date_start === null || this.date_start === 'Invalid date'
    },
    dateEndEmpty: function () {
      return this.date_end === null || this.date_end === 'Invalid date'
    },
    dateRangeHasNull: function () {
      return this.dateStartEmpty || this.dateEndEmpty
    },
    dateStartIsEmptyOnly: function () {
      if (this.dateStartEmpty && !this.dateEndEmpty) {
        return true
      } else {
        return false
      }
    },
    dateEndIsEmptyOnly: function () {
      if (this.dateEndEmpty && !this.dateStartEmpty) {
        return true
      } else {
        return false
      }
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
      let urlParams = this.getOapicParams()
      url += urlParams.join('&')
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
    clearDates: function () {
      this.date_start = null
      this.date_end = null
    },
    checkDateStartIsEmptyOnly: function (dateStart, dateEnd) {
      if (dateStart === 'Invalid date' && dateEnd !== 'Invalid date') {
        return true
      } else {
        return false
      }
    },
    checkDateEndIsEmptyOnly: function (dateStart, dateEnd) {
      if (dateStart !== 'Invalid date' && dateEnd === 'Invalid date') {
        return true
      } else {
        return false
      }
    },
    checkDatesInRange: function (dateStart, dateEnd) {
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
