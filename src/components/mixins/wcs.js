/*
Anything default/common to WCS query UI goes here
*/
export const wcs = {
  data () {
    return {
      wcs_format: 'image/tiff',
      wcs_width: '',
      wcs_height: '',
      wcs_id: 'ABCDEFG',
      date_start: '',
      date_end: '',
      MAX_BANDS: 255
    }
  },
  computed: {
    MAX_YEARS: function () {
      return parseInt(this.MAX_BANDS / 12)
    },
    selectedCoverageIdOption: function () {
      let options = {}
      options[this.wcs_coverage_id] = this.currentRouteTitle
      return options
    },
    tooManyBands: function () {
      return this.dateRangeNumBands > this.MAX_BANDS // default; only applies to CanGRD, CMIP5 and DCS
    },
    timePeriodIsMonthly: function () {
      // MONTHLY for CanGRD; ENS for DCS/CMIP5
      return (this.wcs_id_timePeriod === 'MONTHLY' || this.wcs_id_timePeriod === 'ENS')
    },
    bandsEmptyOnMonthly: function () {
      let startDate = this.$moment.utc(this.bandStartMoment).format(this.dateConfigs.format)
      let endDate = this.$moment.utc(this.bandEndMoment).format(this.dateConfigs.format)
      return (startDate === 'Invalid date' && endDate === 'Invalid date' && this.timePeriodIsMonthly)
    },
    chunkedBandsParam: function () {
      let momentDateUnit = this.timePeriodIsMonthly ? 'M' : 'y' // Month or year
      let chunkStartMoment = this.$moment.utc(this.bandStartMoment)
      let chunkEndMoment = this.$moment.utc(this.bandStartMoment)
      let chunkDuration

      if (this.hasCommonBandErrors) { // range 0 or errors
        return []
      } else if (this.usesBands) {
        let chunkedBands = []
        let chunkLimit = this.MAX_BANDS
        do {
          let chunkStartDate = chunkStartMoment.format(this.dateConfigs.format)
          chunkEndMoment.add(chunkLimit, momentDateUnit)
          if (chunkEndMoment.isAfter(this.bandEndMoment)) { // max date
            chunkEndMoment = this.$moment.utc(this.bandEndMoment)
          }
          let chunkEndDate = chunkEndMoment.format(this.dateConfigs.format)

          chunkDuration = this.$moment.duration(chunkEndMoment.diff(chunkStartMoment))
          chunkDuration = Math.ceil(this.timePeriodIsMonthly ? chunkDuration.asMonths() : (chunkDuration.asYears() - 1))
          if (chunkDuration <= 0) {
            chunkDuration = 1 // case when start === end
          }

          let bandChunk = {
            'start': chunkStartDate,
            'end': chunkEndDate,
            'duration': chunkDuration
          }
          chunkedBands.push(bandChunk)

          // Next chunk
          chunkStartMoment = this.$moment.utc(chunkEndMoment).add(1, momentDateUnit)
        } while (chunkEndMoment.isBefore(this.bandEndMoment))

        return chunkedBands
      } else { // no bands (empty)
        if (this.wcs_id_dataset === 'CANGRD' && this.wcs_id_cangrdType === 'TREND') {
          // CanGRD trends special title
          return [{
            'start': null,
            'end': null,
            'duration': 0,
            'specialTitle': this.variableTypeOptions[this.wcs_id_cangrdType]
          }]
        } else if (this.rangeType === 'year20' && (this.wcs_id_dataset === 'DCS' || this.wcs_id_dataset === 'CMIP5')) {
          // DCS or CMIP5 20-year average special title
          return [{
            'start': null,
            'end': null,
            'duration': 0,
            'specialTitle': this.rangeTypeOptions[this.rangeType]
          }]
        }

        return [{
          'start': null,
          'end': null,
          'duration': 0
        }]
      }
    },
    usesBands: function () {
      return (this.wcs_band !== null && this.wcs_band !== 'Invalid date')
    },
    dateRangeNumBands: function () {
      return 0 // default; only applies to CanGRD, CMIP5 and DCS
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
    wcsCommonUrl: function () {
      let url = this.wcs2_climate_url_base + '&'
      let urlParams = this.getWCSCommonParams(this.wcs_coverage_id)

      url += urlParams.join('&')
      return url
    }
  },
  methods: {
    generateWCSBBOXParam: function () {
      if (this.ows_bbox === '') {
        return null
      } else {
        let xBox = 'SUBSET=x(' + this.reprojected_bbox_parts.min_x + ',' + this.reprojected_bbox_parts.max_x + ')'
        let yBox = 'SUBSET=y(' + this.reprojected_bbox_parts.min_y + ',' + this.reprojected_bbox_parts.max_y + ')'
        return {
          x: xBox,
          y: yBox
        }
      }
    },
    generateWCSRangeSubsetParam: function () {
      if (this.usesBands) {
        return 'RANGESUBSET=' + this.wcs_band
      } else {
        return null
      }
    },
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
    getWCSCommonParams: function (coverageId) {
      let urlParams = []
      urlParams.push('COVERAGEID=' + coverageId)
      urlParams.push('SUBSETTINGCRS=' + this.ows_crs)
      this.splitBBOXString()
      let bbox = this.generateWCSBBOXParam()
      if (bbox !== null) {
        urlParams.push(bbox.x)
        urlParams.push(bbox.y)
      }
      urlParams.push('FORMAT=' + this.wcs_format)

      return urlParams
    },
    wcs_download_url: function (coverageId) {
      let url = this.wcs2_climate_url_base + '&'
      let urlParams = this.getWCSCommonParams(coverageId)

      let band = this.generateWCSRangeSubsetParam()
      if (band !== null) {
        urlParams.push(band)
      }

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
        // MONTHLY for CanGRD; ENS for DCS/CMIP5
        return Math.ceil(this.$moment.duration(end.diff(start)).asMonths()) + 1 // +1 for range is inclusive
      } else if (this.bandsInRange) { // yearly date range
        return Math.ceil(this.$moment.duration(end.diff(start)).asYears())
      } else {
        return 0
      }
    }
  }
}
