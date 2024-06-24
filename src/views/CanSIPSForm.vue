<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-translate>The Canadian Seasonal to Inter-annual Prediction System (CanSIPS) carries out physics calculations to arrive at probabilistic predictions of atmospheric elements from the beginning of a month out to up to 12 months into the future. Atmospheric elements include temperature, precipitation, wind speed and direction and others. This product contains raw numerical results of these calculations. Geographical coverage is global. Data is available on a grid at a horizontal resolution of 2.5 degrees and for a few selected vertical levels. Predictions are made available monthly.</p>

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
      v-model="oapicIdVariable"
      :label="$gettext('Variable')"
      :select-options="variableOptions"></var-select>

    <var-select
      v-model="oapicIdType"
      :label="$gettext('Model type')"
      :disabled="true"
      :readonly="true"
      :select-options="typeOptions"></var-select>

    <num-select
      v-model="oapicMember"
      :label="$gettext('Member')"
      :required="true"
      :max="20"
      :min="1"></num-select>

    <date-select
      v-model="modelRun"
      :label="$gettext('Model run month')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :placeholder="dateConfigs.placeholder"
      :required="true"
      :min-date="modelRunRange.min"
      :max-date="modelRunRange.max"></date-select>

    <date-select
      v-model="forecastPeriod"
      :label="$gettext('Forecast month')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :placeholder="dateConfigs.placeholder"
      :required="true"
      :disabled="true"
      :readonly="true"
      :min-date="forePeriodDateRange.min"
      :max-date="forePeriodDateRange.max"></date-select>

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
import NumSelect from '@/components/NumSelect.vue'
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
    NumSelect,
    DateSelect,
    DataDownloadBox,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources
  },
  data () {
    return {
      oapicIdDataset: 'cansips',
      oapicIdType: 'forecast',
      oapicIdProduct: 'members',
      oapicIdVariable: '1',
      oapicMember: 1,
      hindRunMomentMin: this.$moment.utc('1981-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      hindRunMomentMax: this.$moment.utc('2010-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMin: this.$moment.utc('2013-04-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMax: this.$moment.utc('2022-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), // this.$moment.utc('2018-09-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), missing Aug and Sept 2018 source data
      modelRun: this.$moment.utc('2022-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      forecastPeriod: this.$moment.utc('2022-02-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateConfigs: {
        minimumView: 'month',
        format: 'YYYY-MM',
        placeholder: 'YYYY-MM'
      }
    }
  },
  watch: {
    oapicIdType: function (newVal) {
      // Auto adjust model run date if out of range
      if (newVal === 'HIND') { // Hindcast type
        if (!this.modelRunMoment.isBetween(this.hindRunMomentMin, this.hindRunMomentMax, 'month', '[]')) {
          this.modelRun = this.hindRunMomentMin.format('YYYY-MM')
        }
      } else { // Forecast type
        if (!this.modelRunMoment.isBetween(this.foreRunMomentMin, this.foreRunMomentMax, 'month', '[]')) {
          this.modelRun = this.foreRunMomentMin.format('YYYY-MM')
        }
      }
      this.adjustForePeriod()
    },
    modelRun: function () {
      this.adjustForePeriod()
    }
  },
  computed: {
    oapicCoverageId: function () {
      return `weather:${this.oapicIdDataset}:250km:${this.oapicIdType}:${this.oapicIdProduct}`
    },
    typeOptions: function () {
      return {
        // 'HIND': this.$gettext('Hindcast'),
        'forecast': this.$gettext('Forecast')
      }
    },
    variableOptions: function () {
      return {
        '4': this.$gettext('Sea level pressure'),
        '3': this.$gettext('Instantaneous precipitation rate (m/s)'),
        '1': this.$gettext('Air temperature'),
        '6': this.$gettext('Water temperature'),
        '2': this.$gettext('Geopotential height at 500mb'),
        '5': this.$gettext('Air temperature at 850mb')
        // 'PRES_UU.850': this.$gettext('Winds at 850mb')
      }
    },
    filename: function () {
      return this.variableOptions[this.oapicIdVariable] + ' (' + this.oapicCoverageId + ')'
    },
    forecastPeriodMoment: function () {
      return this.$moment.utc(this.forecastPeriod)
    },
    forecastPeriodISO: function () {
      return this.forecastPeriodMoment.format('YYYY-MM-DD[T]HH:mm:ss[Z]')
    },
    oapicDatetime: function() {
      return this.forecastPeriodMoment.format('YYYY-MM')
    },
    modelRunMoment: function () {
      return this.$moment.utc(this.modelRun)
    },
    modeRunIsEmpty: function () {
      return this.modelRun === null || this.modelRun === 'Invalid date'
    },
    forePeriodIsEmpty: function () {
      return this.forecastPeriod === null || this.forecastPeriod === 'Invalid date'
    },
    modelRunISO: function () {
      return this.modelRunMoment.format('YYYY-MM-DD[T]HH:mm:ss[Z]')
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
    forePeriodDateRange: function () {
      return {
        min: this.forePeriodMomentRange.min.toDate(),
        max: this.forePeriodMomentRange.max.toDate()
      }
    },
    forePeriodOutOfRange: function () {
      let foreDate = this.forecastPeriodMoment
      let minimumView = this.dateConfigs.minimumView

      // ignore check if null
      if (this.forePeriodIsEmpty) {
        return false
      }

      return foreDate.isBefore(this.forePeriodMomentRange.min, minimumView) ||
        foreDate.isAfter(this.forePeriodMomentRange.max, minimumView)
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
      context.push(`${this.$gettext('Member')}${this.$pgettext('Colon', ':')} ${this.oapicMember}`)
      context.push(`${this.$gettext('Model run month')}${this.$pgettext('Colon', ':')} ${this.oapicModelRun}`)
      context.push(`${this.$gettext('Forecast month')}${this.$pgettext('Colon', ':')} ${this.oapicDatetime}`)
      context.push(this.fileFormats[this.oapicFormat])
      return context
    },
    hasErrors: function () {
      return this.forePeriodOutOfRange ||
        this.modelRunOutOfRange ||
        this.forePeriodIsEmpty ||
        this.modelRunIsEmpty
    },
    cansipsCoverageMetadata: function () {
      return `${this.oapicServer}/collections/weather:cansips:250km:forecast:members?f=json`
    }
  },
  methods: {
    adjustForePeriod: function () {
      // Auto adjust forecast period date if out of range
      if (!this.forecastPeriodMoment.isBetween(this.forePeriodMomentRange.min, this.forePeriodMomentRange.max, 'month')) {
        this.forecastPeriod = this.forePeriodMomentRange.min.format('YYYY-MM')
      }
    },
    getOapicParams: function () {
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      urlParams.push(`properties=${this.oapicIdVariable}`)

      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x},${this.bbox_parts.min_y},${this.bbox_parts.max_x},${this.bbox_parts.max_y}`)

      // subset
      let subset = []
      // subset: member (1-20)
      subset.push(`member(${this.oapicMember})`)
      // subset: dim_reference_time (2013-04 to 2022-01)
      subset.push(`dim_reference_time("${this.oapicModelRun}")`)
      urlParams.push(`subset=${subset.join(',')}`)

      // datetime (single YYYY-MM or range YYYY-MM/YYYY-MM)
      urlParams.push(`datetime=${this.oapicDatetime}`)

      return urlParams
    }
  },
  beforeMount(){
    // make api call to get the upper bound for date selector
    let this_ = this

    axios.get(this_.cansipsCoverageMetadata)
      .then(function (response) {
        const upperBound = response.data.domainset.generalGrid.axis[3].upperBound
        this_.foreRunMomentMax = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss')
        this_.modelRun = this_.$moment.utc(`${upperBound}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
