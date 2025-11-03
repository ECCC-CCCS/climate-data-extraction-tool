<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-html="cansips_summary"></p>
    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="openPortalHtml"></p>
    </details>

    <bbox-map
      v-model="mapBBOX"
      @change="splitBBOXString"></bbox-map>

    <var-select
      v-model="oapicIdProduct"
      :label="$gettext('Interval type')"
      :select-options="productOptions"></var-select>

    <var-select
      v-model="oapicIdVariable"
      :label="$gettext('Variable')"
      :select-options="variableOptions"></var-select>

    <var-select
      v-model="oapicIdProbability"
      :label="$gettext('Probability')"
      :select-options="probabilityOptions"></var-select>

    <date-select
      v-model="modelRun"
      :label="$gettext('Model run month')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :placeholder="dateConfigs.placeholder"
      :required="true"
      :min-date="modelRunRange.min"
      :max-date="modelRunRange.max"></date-select>

    <var-select
      v-model="forecastPeriod"
      :label="$gettext('Forecast period')"
      :disabled="invalidModelMonth"
      :select-options="monthOptions"></var-select>

    <format-select-file
      v-model="oapicFormat"
      :formats="fileFormats"></format-select-file>

    <data-download-box
      :file-name="filename"
      :file-format="oapicFormat"
      :download-url="oapicUrl"
      :download-context="downloadContext"
      :has-errors="hasErrors">
    </data-download-box>

    <more-resources></more-resources>
  </section>
</template>

<script>
import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectFile from '@/components/FormatSelectFile.vue'
import VarSelect from '@/components/VarSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import DataDownloadBox from '@/components/DataDownloadBox.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import MoreResources from '@/components/MoreResources.vue'
import { ows } from '@/components/mixins/ows.js'
import { oapiCoverage } from '@/components/mixins/oapi-coverages.js'
import { datasets } from '@/components/mixins/datasets.js'
import axios from 'axios'

export default {
  name: 'CanSIPSForm',
  mixins: [ows, oapiCoverage, datasets],
  components: {
    'bbox-map': BBOXMap,
    FormatSelectFile,
    VarSelect,
    DateSelect,
    DataDownloadBox,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources
  },
  data () {
    return {
      invalidModelMonth: false,
      oapicIdDataset: 'cansips',
      oapicIdType: 'forecast',
      oapicIdProduct: 'monthly-products',
      oapicIdVariable: 'AirTemp',
      forecastPeriod: 'P00M',
      oapicIdProbability: '-ProbNearNormal',
      hindRunMomentMin: this.$moment.utc('1981-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      hindRunMomentMax: this.$moment.utc('2010-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMin: this.$moment.utc('2025-04-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMax: this.$moment.utc('2025-05-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), // this.$moment.utc('2018-09-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), missing Aug and Sept 2018 source data
      modelRun: this.$moment.utc('2025-05-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateConfigs: {
        minimumView: 'month',
        format: 'YYYY-MM',
        placeholder: 'YYYY-MM'
      },
      summaryLink: {
        en: process.env.VUE_APP_CLIMATE_SCENARIOS_EN + '/?page=cansips-prob',
        fr: process.env.VUE_APP_CLIMATE_SCENARIOS_FR + '/?page=cansips-prob'
      }
    }
  },
  watch: {
    modelRun: function () {
      // Locks forecast period option if using an invalid model run month
      if(this.hasErrors){
        this.invalidModelMonth = true
      }else{
        this.invalidModelMonth = false
      }

      // Adjustment for changing the interval type
      if(this.oapicIdProduct === 'seasonal-products'){
        this.forecastPeriod = 'P00M-P02M'
      }else{
        this.forecastPeriod = 'P00M'
      }
    },
    oapicIdProduct: function (newVal){
      // Changing the interval type. Lower date bound of seasonal and monthly probability products are different, might need to adjust.
      // When changing intrval type, the date boundaries only need to be adjusted for probability dates
      // All exceedence products have the same boundaries <- TODO if this changes need to fetch boundaries
      const longRangeProducts = ['-ProbNearNormal', '-ProbAboveNormal', '-ProbBelowNormal']

      if (newVal === 'seasonal-products'){
        this.forecastPeriod = 'P00M-P02M'
      }else{
        this.forecastPeriod = 'P00M'
      }
      if(longRangeProducts.includes(this.oapicIdProbability)){
        let this_ = this
        axios.get(this_.cansipsCoverageMetadata)
          .then(function (response) {
            const upperBound = response.data.extent.reference_time.interval[0][1]
            const lowerBound = response.data.extent.reference_time.interval[0][0]

            if(this_.$moment.utc(this_.modelRun).isBefore(this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss'))
              || this_.$moment.utc(this_.modelRun).isAfter(this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss'))){
            
              this_.modelRun = this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
            }
            this_.foreRunMomentMax = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
            this_.foreRunMomentMin = this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
          })
      }
    },
    oapicIdProbability: function (newval){
      const longRangeProducts = ['-ProbNearNormal', '-ProbAboveNormal', '-ProbBelowNormal']

      // When changing from exceedence to probability seasonal product need to make sure
      // forecast period is valid
      const invalidProbPeriods = ['P02M-P04M', 'P04M-P06M', 'P05M-P07M', 'P07M-P09M', 'P08M-P10M']
      if(invalidProbPeriods.includes(this.forecastPeriod) && longRangeProducts.includes(newval)){
        this.forecastPeriod = 'P00M-P02M'
      }

      // TODO make dynamic when able to fetch date boundaries from request
      if (!(longRangeProducts.includes(newval))){
        // All exceedence products have a lower bound date at 2025-05 for now, this needs to be changed to
        // be dynamic
        const exceedMin = this.$moment.utc(`2025-05-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
        if(this.foreRunMomentMin !== exceedMin){
          // Changing from probability to exceedence product, check if need to adjust date
          if(this.$moment.utc(this.modelRun).isBefore(exceedMin)){
            this.modelRun = exceedMin.toDate()
          }
          this.foreRunMomentMin = exceedMin
        }
      }else{
        let this_ = this
        axios.get(this_.cansipsCoverageMetadata)
          .then(function (response){
            const upperBound = response.data.extent.reference_time.interval[0][1]
            const lowerBound = response.data.extent.reference_time.interval[0][0]

            if(this_.$moment.utc(this_.modelRun).isBefore(this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss'))
            || this_.$moment.utc(this_.modelRun).isAfter(this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss'))){
              this_.modelRun = this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
            }
            this_.foreRunMomentMax = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
            this_.foreRunMomentMin = this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
          })
      }
    },
  },
  computed: {
    oapicCoverageId: function () {
      return `weather:${this.oapicIdDataset}:100km:${this.oapicIdType}:${this.oapicIdProduct}`
    },
    typeOptions: function () {
      return {
        'forecast': this.$gettext('Forecast')
      }
    },
    variableOptions: function () {
      return {
        'AirTemp': this.$gettext('Air temperature'),
        'PrecipAccum' : this.$gettext('Precipitation')
      }
    },
    probabilityOptions: function (){
      // With the current implementation there are 3 probability products and 9 exceedence products per variable type
      var probOptions = {}

      // Probability Products
      // Couldn't hardcode due to needing to translate
      probOptions['-ProbNearNormal'] = this.$gettext('Probability near normal')
      probOptions['-ProbAboveNormal'] = this.$gettext('Probability above normal')
      probOptions['-ProbBelowNormal'] = this.$gettext('Probability below normal')

      // Exceedence products
      const exceedProducts = ['10', '20', '30', '40', '50', '60', '70', '80', '90']
      if (this.oapicIdVariable === 'AirTemp'){
        var units = 'K'
      }else{
        units = 'kg/(m²)'
      }
      exceedProducts.forEach(option => {
        probOptions[`-ProbGT${option}Pct`] = this.$_i(
          this.$pgettext(
            'The dropdown display for an exceedence product. option specifies the product, units depends on the variable type',
            'Probability greater than {exceedOption} {varUnits}'),
            {exceedOption: option, varUnits: units}
          )
      })
      return probOptions
    },
    monthOptions: function () {
      var periodsWithMessages = {}
      if (this.oapicIdProduct === 'monthly-products'){
        const periods = ['P00M', 'P01M', 'P02M', 'P03M', 'P04M', 'P05M', 'P06M', 'P07M', 'P08M',
          'P09M', 'P10M', 'P11M']
        const periodsLen = periods.length
        for (let i=0;i<periodsLen;i++){
          periodsWithMessages[periods[i]] = `${this.$moment.utc(this.modelRunMoment).add(i, 'months').format('YYYY-MM')} (${periods[i]})`
        }
        return periodsWithMessages
      }else{
        // Need to reduce available periods for seasonal probability products
        const probProducts = ['-ProbNearNormal', '-ProbAboveNormal', '-ProbBelowNormal']
        if(probProducts.includes(this.oapicIdProbability)){
          const periods = ['P00M-P02M', 'P01M-P03M', 'P03M-P05M', 'P06M-P08M', 'P09M-P11M']
          var offsetter = 0
          periods.forEach(period => {
            periodsWithMessages[period] = this.$_i(
                                              this.$pgettext(
                                                'startYYYYMM and endYYYYMM represent the start and end dates. periodValue represents the forecast period', '{startYYYYMM} to {endYYYYMM} ({periodValue})'), 
                                                {startYYYYMM: this.$moment.utc(this.modelRunMoment).add(offsetter, 'months').format('YYYY-MM'), endYYYYMM: this.$moment.utc(this.modelRunMoment).add(offsetter+2, 'months').format('YYYY-MM'), periodValue: period}
                                            )
            if(period === 'P00M-P02M'){
              offsetter = offsetter+1
            }else if(period === 'P01M-P03M'){
              offsetter = offsetter+2
            }else{
              offsetter = offsetter+3
            }
          })
          return periodsWithMessages
        }
        const periods = ['P00M-P02M', 'P01M-P03M', 'P02M-P04M', 'P03M-P05M', 'P04M-P06M', 'P05M-P07M', 'P06M-P08M', 'P07M-P09M', 'P08M-P10M', 'P09M-P11M']
        const periodsLen = periods.length

        for(let offsetter=0; offsetter<periodsLen; offsetter++){
          periodsWithMessages[periods[offsetter]] = this.$_i(
                                              this.$pgettext(
                                                'startYYYYMM and endYYYYMM represent the start and end dates. periodValue represents the forecast period', '{startYYYYMM} to {endYYYYMM} ({periodValue})'), 
                                                {startYYYYMM: this.$moment.utc(this.modelRunMoment).add(offsetter, 'months').format('YYYY-MM'), endYYYYMM: this.$moment.utc(this.modelRunMoment).add(offsetter+2, 'months').format('YYYY-MM'), periodValue: periods[offsetter]}
                                            )
        }
        return periodsWithMessages
      } 
    },
    productOptions: function () {
      return {
        'monthly-products': this.$gettext('Monthly'),
        'seasonal-products': this.$gettext('Seasonally')
      }
    },

    filename: function () {
      return this.variableOptions[this.oapicIdVariable] + this.probabilityOptions[this.oapicIdProbability] + ' (' + this.oapicCoverageId + ')'
    },
    modelRunMoment: function () {
      return this.$moment.utc(this.modelRun)
    },
    modelRunIsEmpty: function () {
      return this.modelRun === null || this.modelRun === 'Invalid date'
    },

    oapicModelRun: function () {
      return this.modelRunMoment.format('YYYY-MM')
    },
    modelRunRangeMoment: function () {
      // Model run range limits based on what type selected
      if (this.oapicIdType === 'HIND') {
        return {
          min: this.hindRunMomentMin,
          max: this.hindRunMomentMax
        }
      } else {
        return {
          min: this.foreRunMomentMin,
          max: this.foreRunMomentMax
        }
      }
    },
    modelRunRange: function () {
      return {
        min: this.modelRunRangeMoment.min.toDate(),
        max: this.modelRunRangeMoment.max.toDate()
      }
    },
    forePeriodMomentRange: function () {
      // based off of selected model run date
      return {
        min: this.$moment.utc(this.modelRunMoment).add(1, 'months'), // 1 month
        max: this.$moment.utc(this.modelRunMoment).add(1, 'months') // // TEMP: set to 1 month default // 12 months ahead; can't add on computed value
      }
    },
    modelRunOutOfRange: function () {
      let modelDate = this.modelRunMoment
      let minimumView = this.dateConfigs.minimumView

      // ignore check if null
      if (this.modelRunIsEmpty) {
        return false
      }

      return modelDate.isBefore(this.modelRunRangeMoment.min, minimumView) ||
        modelDate.isAfter(this.modelRunRangeMoment.max, minimumView)
    },
    downloadContext: function () {
      let context = []
      context.push(this.oapicIdDataset)
      context.push(this.variableOptions[this.oapicIdVariable])
      context.push(this.probabilityOptions[this.oapicIdProbability])
      
      context.push(`${this.$gettext('Model run month')}${this.$pgettext('Colon', ':')} ${this.oapicModelRun}`)
      if (this.oapicIdProduct === 'monthly-products'){
        context.push(`${this.$gettext('Forecast month')}${this.$pgettext('Colon', ':')} ${this.monthOptions[this.forecastPeriod].split(', ')[0]}`)
      }else{
        context.push(`${this.$gettext('Forecast months')}${this.$pgettext('Colon', ':')} ${this.monthOptions[this.forecastPeriod].split(', ')[0]}`)
      }
      context.push(this.fileFormats[this.oapicFormat])
      return context
    },
    hasErrors: function () {
      return this.modelRunOutOfRange || this.modelRunIsEmpty
    },
    cansips_summary: function () {
      return this.$_i(this.$gettext('The Canadian Seasonal to Inter-annual Prediction System (CanSIPS) carries out physics calculations to arrive at probabilistic predictions of temperature and precipitation from the beginning of a month out to up to 12 months into the future. This product presents the probabilities of the upcoming seasons and months having temperature and precipitation above, near and below normal, as well as being above various historical percentiles. Geographical coverage is global. Data is available on a grid at a resolution of 1x1 degrees. New predictions are made available monthly. For data on a map, more variables, guidance and more information about skill please see <a href={link} target=_blank>Seasonal forecasts for Canada</a>'), {link: this.summaryLink[this.$i18n.activeLocale]})
    },
    cansipsCoverageMetadata: function () {
      // TODO may need to adjust URL when exceedence data is available
      return `${this.oapicServer}/collections/weather:cansips:100km:forecast:${this.oapicIdProduct}?f=json`
    }
  },
  methods: {
    getOapicParams: function () {
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      urlParams.push(`properties=${this.oapicIdVariable}${this.oapicIdProbability}`)

      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x},${this.bbox_parts.min_y},${this.bbox_parts.max_x},${this.bbox_parts.max_y}`)

      // subset
      let subset = []

      subset.push(`period("${this.forecastPeriod}")`)

      subset.push(`reference_time("${this.oapicModelRun}")`)
      urlParams.push(`subset=${subset.join(',')}`)
      return urlParams
    }
  },
  beforeMount(){
    // make api call to get the upper bound for date selector
    let this_ = this
    axios.get(this_.cansipsCoverageMetadata)
      .then(function (response) {
        const upperBound = response.data.extent.reference_time.interval[0][1]
        this_.foreRunMomentMax = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
        this_.modelRun = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()

        const lowerBound = response.data.extent.reference_time.interval[0][0]
        this_.foreRunMomentMin = this_.$moment.utc(`${lowerBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
