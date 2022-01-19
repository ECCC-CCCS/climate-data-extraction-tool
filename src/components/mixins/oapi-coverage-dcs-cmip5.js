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
      oapicIdVariable: 'tas',
      oapicScenario: 'RCP2.6',
      oapicIdTimePeriod: 'annual',
      mapBBOX: '-154,38,-49,81',
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
        this.rangeType = 'custom'

        // Autocorrect histStart date for DCS if out of range
        if (this.oapicIdDataset === 'DCS') {
          let histStart = this.$moment.utc(this.dateHistStart, this.dateConfigs.format)
          if (histStart.isBefore(this.dateConfigs.dateMin) || histStart.isAfter(this.dateConfigs.dateMax)) {
            this.dateHistStart = this.$moment.utc(this.dateConfigs.dateMin).toDate()
          }
        } else { // CMIP5
          // Auto correct dates for Temp and Precip
          if (this.oapicIdVariable === 'tas' || this.oapicIdVariable === 'pr') {
            this.correctDatestas_pr()
          }
        }
      } else {
        this.oapicScenario = this.lastSelectedRCP
      }
    },
    oapicIdTimePeriod: function (newVal) { // overwrites dcs-cmip5 mixin
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'monthly') {
        this.valueType = 'absolute'
        this.rangeType = 'custom'

        // Auto correct dates for wind selection (CMIP5)
        if (this.oapicIdVariable === 'sfcWind' && this.oapicIdDataset === 'CMIP5') {
          this.correctDatessfcWind()
        }
      }
      // adjust dates if they are strings to match new date format
      this.dateRcpStart = this.formatDateToMoment(this.dateRcpStart).format(this.dateConfigs.format)
      this.dateRcpEnd = this.formatDateToMoment(this.dateRcpEnd).format(this.dateConfigs.format)
    },
    valueType: function (newVal) {
      if (newVal === 'absolute') {
        this.rangeType = 'custom'
      }
    },
    rangeType: function (newVal) {
      // Force percentile to 50th
      if (newVal === 'P20Y-Avg') {
        this.percentile = '50'
      }
    }
  },
  methods: {
    getOapicParams: function () {
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
        urlParams.push(`datetime=${this.oapicDatetime}`)
      }
      return urlParams
    },
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
    downloadContext: function () {
      let context = []
      context.push(this.oapicIdDataset)
      context.push(this.variableOptions[this.oapicIdVariable])
      context.push(this.scenarioTypeOptions[this.scenarioType])
      context.push(this.oapicScenario)
      context.push(this.timePeriodOptions[this.oapicIdTimePeriod])
      context.push(this.valueTypeOptions[this.valueType])
      context.push(this.percentileOptions[this.percentile])
      context.push(this.rangeType === 'P20Y-Avg' ? this.avg20Year : this.oapicDatetime)
      context.push(this.fileFormats[this.oapicFormat])

      return context
    },
    avg20YearOptions: function () {
      return {
        '2021-2040': '2021-2040',
        '2041-2060': '2041-2060',
        '2061-2080': '2061-2080',
        '2081-2100': '2081-2100'
      }
    },
    percentileOptions: function () {
      if (this.rangeType === 'P20Y-Avg') {
        return {
          50: this.$gettext('50th percentile')
        }
      } else {
        return {
          5: this.$gettext('5th percentile'),
          25: this.$gettext('25th percentile'),
          50: this.$gettext('50th percentile'),
          75: this.$gettext('75th percentile'),
          95: this.$gettext('95th percentile')
        }
      }
    },
    oapicCoverageId: function () {
      return 'climate:' + this.oapicIdDataset + ':' + this.scenarioType + ':' + this.timePeriodType + ':' + this.oapicValueType
    },
    oapicDatetime: function () {
      return this.dateStartMoment.format(this.dateConfigs.format) + '/' + this.dateEndMoment.format(this.dateConfigs.format)
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
      if (this.oapicIdTimePeriod === 'monthly') {
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
      } else if (this.oapicIdTimePeriod === 'monthly' || (this.valueType === 'absolute' && this.oapicIdTimePeriod === 'monthly')) {
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
    seasonOptions: function () {
      return {
        MAM: this.$gettext('Spring (March-May)'),
        JJA: this.$gettext('Summer (June-August)'),
        SON: this.$gettext('Fall (September-November)'),
        DJF: this.$gettext('Winter (December-February)')
      }
    },
    timePeriodOptions: function () {
      return {
        ...this.seasonOptions,
        annual: this.$gettext('Annual'),
        monthly: this.$gettext('Monthly')
      }
    },
    timePeriodType: function () {
      if (['annual', 'monthly'].includes(this.oapicIdTimePeriod)) {
        return this.oapicIdTimePeriod
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
      if (this.oapicIdDataset === 'DCS' && this.scenarioType === 'historical') {
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
      if (this.oapicIdTimePeriod === 'monthly') {
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
        return this.checkDatesInRange(this.bandMoments.rcpStart, this.bandMoments.rcpEnd)
      } else { // history
        return this.checkDatesInRange(this.bandMoments.histStart, this.bandMoments.histEnd)
      }
    },
    bandStartIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
        return this.checkDateStartIsEmptyOnly(this.dateRcpStart, this.dateRcpEnd)
      } else { // history
        return this.checkDateStartIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandEndIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
        return this.checkDateEndIsEmptyOnly(this.dateRcpStart, this.dateRcpEnd)
      } else { // history
        return this.checkDateEndIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
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
