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
      var wcsCoverage = {}
      wcsCoverage[this.wcs_coverage_id] = this.currentRouteTitle
      return wcsCoverage
    },
    tooManyBands: function () {
      return this.dateRangeNumBands > this.MAX_BANDS // default; only applies to CanGRD, CMIP5 and DCS
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
      if (this.tooManyBands) {
        // return this.$_i(this.$gettext('Date range duration must be {maxBands} months ({maxYears} years) or less. Your current date range duration contains {numBands} months.'), {maxBands: this.MAX_BANDS, maxYears: this.MAX_YEARS, numBands: this.dateRangeNumBands})
        if (this.dateConfigs.minimumView === 'month') {
          return this.$_i(this.$gettext('Date range selection must be {maxBands} months or less. Current date range selection contains {numBands} months.'), {numBands: this.dateRangeNumBands, maxBands: this.MAX_BANDS})
        } else if (this.dateConfigs.minimumView === 'year') { // year
          return this.$_i(this.$gettext('Date range selection must be {maxBands} years or less. Current date range selection contains {numBands} years.'), {numBands: this.dateRangeNumBands, maxBands: this.MAX_BANDS})
        }
      }
      return '' // no errors
    }
  },
  methods: {
    generateWCSBBOXParam: function () {
      if (this.ows_bbox === '') {
        return null
      } else {
        var xBox = 'SUBSET=x(' + this.reprojected_bbox_parts.min_x + ',' + this.reprojected_bbox_parts.max_x + ')'
        var yBox = 'SUBSET=y(' + this.reprojected_bbox_parts.min_y + ',' + this.reprojected_bbox_parts.max_y + ')'
        return {
          x: xBox,
          y: yBox
        }
      }
    },
    generateWCSRangeSubsetParam: function () {
      if (this.wcs_band !== null && this.wcs_band !== 'Invalid date') {
        return 'RANGESUBSET=' + this.wcs_band
      } else {
        return null
      }
    },
    bandRangeFormat: function (bandStart, bandEnd) {
      // Check for null and append "B"
      if (bandStart === null || bandEnd === null || bandStart === 'Invalid date' || bandEnd === 'Invalid date') {
        return null
      } else if (bandStart === bandEnd) { // single date
        return 'B' + bandStart
      } else { // date range
        return 'B' + bandStart + ':B' + bandEnd
      }
    },
    wcs_download_url: function (coverageId) {
      this.splitBBOXString()
      var url = this.wcs2_climate_url_base + '&'
      var urlParams = []

      urlParams.push('COVERAGEID=' + coverageId)
      var band = this.generateWCSRangeSubsetParam()
      if (band !== null) {
        urlParams.push(band)
      }
      urlParams.push('SUBSETTINGCRS=' + this.ows_crs)
      var bbox = this.generateWCSBBOXParam()
      if (bbox !== null) {
        urlParams.push(bbox.x)
        urlParams.push(bbox.y)
      }
      urlParams.push('FORMAT=' + this.wcs_format)

      url += urlParams.join('&')
      return url
    },
    clearDates: function (evt) {
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
    }
  }
}
