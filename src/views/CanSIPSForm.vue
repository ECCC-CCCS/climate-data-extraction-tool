<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p>{{ textIntroTip.gridded.use }}</p>
    <p>{{ textIntroTip.gridded.instructions }}</p>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Technical information and metadata</summary>
      <p v-translate>The Canadian Seasonal to Inter-annual Prediction System (CanSIPS) carries out physics calculations to arrive at probabilistic predictions of atmospheric elements from the beginning of a month out to up to 12 months into the future. Atmospheric elements include temperature, precipitation, wind speed and direction and others. This product contains raw numerical results of these calculations. Geographical coverage is global. Data is available on a grid at a horizontal resolution of 2.5 degrees and for a few selected vertical levels. Predictions are made available monthly.</p>

      <p v-html="openPortalHtml"></p>
    </details>

    <info-contact-support></info-contact-support>

    <bbox-map
      v-model="ows_bbox"
      @change="splitBBOXString"></bbox-map>

    <var-select
      v-model="wcs_id_variable"
      :label="$gettext('Variable')"
      :select-options="variableOptions"></var-select>

    <var-select
      v-model="wcs_id_type"
      :label="$gettext('Model type')"
      :disabled="true"
      :readonly="true"
      :select-options="typeOptions"></var-select>

    <num-select
      v-model="wcs_id_member"
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

    <format-select-raster
      v-model="wcs_format"
      :info-text="[infoSupportDeskGridPoint]"></format-select-raster>

    <details>
      <summary v-translate>Advanced options</summary>
      <var-select
        v-model="ows_crs"
        :label="crsLabel"
        :initial-variable="ows_crs"
        :select-options="crsOptions"></var-select>
    </details>

    <url-box
      :layer-options="selectedCoverageIdOption"
      :ows-url-formatter="wcs_download_url"
      :layer-format="wcs_format"
      :has-errors="hasErrors"
      :url-box-title="$gettext('Data download link')">
    </url-box>
  </section>
</template>

<script>
import BBOXMap from '@/components/BBOXMap'
import FormatSelectRaster from '@/components/FormatSelectRaster'
import VarSelect from '@/components/VarSelect.vue'
import NumSelect from '@/components/NumSelect'
import DateSelect from '@/components/DateSelect'
import URLBox from '@/components/URLBox'
import InfoContactSupport from '@/components/InfoContactSupport'
import DataAccessDocLink from '@/components/DataAccessDocLink'
import { wcs } from '@/components/mixins/wcs'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'

export default {
  name: 'CanSIPSForm',
  mixins: [wcs, ows, datasets],
  components: {
    'bbox-map': BBOXMap,
    'format-select-raster': FormatSelectRaster,
    'var-select': VarSelect,
    'num-select': NumSelect,
    'date-select': DateSelect,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport,
    DataAccessDocLink
  },
  data () {
    return {
      wcs_id_dataset: 'CANSIPS',
      wcs_id_type: 'FORE',
      wcs_id_product: 'MEM',
      wcs_id_variable: 'ETA_PN-SLP',
      wcs_id_member: 1,
      hindRunMomentMin: this.$moment.utc('1981-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      hindRunMomentMax: this.$moment.utc('2010-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMin: this.$moment.utc('2013-04-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMomentMax: this.$moment.utc('2018-07-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), // this.$moment.utc('2018-09-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'), missing Aug and Sept 2018 source data
      modelRun: this.$moment.utc('2018-07-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      forecastPeriod: this.$moment.utc('2018-08-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateConfigs: {
        minimumView: 'month',
        format: 'YYYY-MM',
        placeholder: 'YYYY-MM'
      }
    }
  },
  watch: {
    wcs_id_type: function (newVal) {
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
    wcs_coverage_id: function () {
      // generate coverageID
      let coverageIdParts = []
      coverageIdParts.push(this.wcs_id_dataset)
      if (this.wcs_id_type === 'HIND') {
        coverageIdParts.push(this.wcs_id_type)
      }
      coverageIdParts.push(this.wcs_id_product)
      coverageIdParts.push(this.wcs_id_variable)
      coverageIdParts.push((this.wcs_id_member < 10 ? '0' : '') + this.wcs_id_member)
      return coverageIdParts.join('.')
    },
    typeOptions: function () {
      return {
        // 'HIND': this.$gettext('Hindcast'),
        'FORE': this.$gettext('Forecast')
      }
    },
    variableOptions: function () {
      return {
        'ETA_PN-SLP': this.$gettext('Sea level pressure'),
        'ETA_RT': this.$gettext('Instantaneous precipitation rate (m/s)'),
        'ETA_TT': this.$gettext('Air temperature'),
        'ETA_WTMP': this.$gettext('Water temperature'),
        'PRES_GZ.500': this.$gettext('Geopotential height at 500mb'),
        'PRES_TT.850': this.$gettext('Air temperature at 850mb')
        // 'PRES_UU.200': this.$gettext('Winds at 200mb'), // PRES_UU currently not served, never was
        // 'PRES_UU.850': this.$gettext('Winds at 850mb')
      }
    },
    selectedCoverageIdOption: function () {
      let wcsCoverage = {}
      wcsCoverage[this.wcs_coverage_id] = this.variableOptions[this.wcs_id_variable] + ' (' + this.wcs_coverage_id + ')'
      return wcsCoverage
    },
    forecastPeriodMoment: function () {
      return this.$moment.utc(this.forecastPeriod)
    },
    forecastPeriodISO: function () {
      return this.forecastPeriodMoment.format('YYYY-MM-DD[T]HH:mm:ss[Z]')
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
    modelRunRangeMoment: function () {
      // Model run range limits based on what type selected
      if (this.wcs_id_type === 'HIND') {
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
    hasErrors: function () {
      return this.forePeriodOutOfRange ||
        this.modelRunOutOfRange ||
        this.forePeriodIsEmpty ||
        this.modelRunIsEmpty
    }
  },
  methods: {
    wcs_download_url: function (coverageId) { // replaces existing function from wcs mixin
      this.splitBBOXString()
      let url = this.wcs2_weather_url_base + '&'
      let urlParams = this.getWCSCommonParams(coverageId)

      // Model Run
      let mr = this.modelRunISO
      if (mr !== '' && mr !== null) {
        urlParams.push('DIM_REFERENCE_TIME=' + mr)
      }

      // Forecast Time
      let ft = this.forecastPeriodISO
      if (ft !== '' && ft !== null) {
        urlParams.push('TIME=' + ft)
      }

      url += urlParams.join('&')
      return url
    },
    adjustForePeriod: function () {
      // Auto adjust forecast period date if out of range
      if (!this.forecastPeriodMoment.isBetween(this.forePeriodMomentRange.min, this.forePeriodMomentRange.max, 'month')) {
        this.forecastPeriod = this.forePeriodMomentRange.min.format('YYYY-MM')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
