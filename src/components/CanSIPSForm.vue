<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

        <download-warning></download-warning>

        <p>{{ introDatasetText.gridded.use }}</p>
        <p>{{ introDatasetText.gridded.instructions }}</p>

        <details v-bind:open="toggleDetailsState">
          <summary v-on:click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>The Canadian Seasonal to Inter-annual Prediction System (CanSIPS) carries out physics calculations to arrive at probabilistic predictions of atmospheric elements from the beginning of a month out to up to 12 months into the future. Atmospheric elements include temperature, precipitation, wind speed and direction and others. This product contains raw numerical results of these calculations. Geographical coverage is global. Data is available on a grid at a horizontal resolution of 2.5 degrees and for a few selected vertical levels. Predictions are made available monthly.</p>

          <p v-html="openPortalHtml"></p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-on:change="splitBBOXString"></bbox-map>

        <var-select
          v-model="wcs_id_variable"
          v-bind:label="$gettext('Variable')"
          v-bind:select-options="variableOptions"></var-select>

        <var-select
          v-model="wcs_id_type"
          v-bind:label="$gettext('Model type')"
          v-bind:disabled="true"
          v-bind:readonly="true"
          v-bind:select-options="typeOptions"></var-select>

        <num-select
          v-model="wcs_id_member"
          v-bind:label="$gettext('Member')"
          v-bind:required="true"
          v-bind:max="20"
          v-bind:min="1"></num-select>

        <date-select
          v-model="modelRun"
          v-bind:label="$gettext('Model run month')"
          v-bind:minimum-view="dateConfigs.minimumView"
          v-bind:format="dateConfigs.format"
          v-bind:placeholder="dateConfigs.placeholder"
          v-bind:required="true"
          v-bind:min-date="modelRunRange.min"
          v-bind:max-date="modelRunRange.max"></date-select>

        <date-select
          v-model="forecastPeriod"
          v-bind:label="$gettext('Forecast month')"
          v-bind:minimum-view="dateConfigs.minimumView"
          v-bind:format="dateConfigs.format"
          v-bind:placeholder="dateConfigs.placeholder"
          v-bind:required="true"
          v-bind:disabled="true"
          v-bind:readonly="true"
          v-bind:min-date="forePeriodDateRange.min"
          v-bind:max-date="forePeriodDateRange.max"></date-select>

        <format-select-raster
          v-model="wcs_format"
          v-bind:info-text="[infoSupportDeskGridPoint]"></format-select-raster>

        <details v-bind:open="toggleDetailsAdvState">
          <summary v-on:click="toggleDetailsAdv"
            v-translate>Advanced options</summary>
          <var-select
            v-model="ows_crs"
            v-bind:label="crsLabel"
            v-bind:initial-variable="ows_crs"
            v-bind:select-options="crsOptions"></var-select>
        </details>

        <url-box
          v-bind:layer-options="selectedCoverageIdOption"
          v-bind:ows-url-formatter="wcs_download_url"
          v-bind:layer-format="wcs_format"
          v-bind:has-errors="hasErrors"
          v-bind:url-box-title="$gettext('Data download link')">
        </url-box>
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from './DatasetMenu'
import BBOXMap from './BBOXMap'
import FormatSelectRaster from './FormatSelectRaster'
import VarSelect from './VarSelect'
import NumSelect from './NumSelect'
import DateSelect from './DateSelect'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import DownloadWarning from './DownloadWarning'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'CanSIPSForm',
  mixins: [wcs, ows, datasets],
  components: {
    'dataset-menu': DatasetMenu,
    'bbox-map': BBOXMap,
    'format-select-raster': FormatSelectRaster,
    'var-select': VarSelect,
    'num-select': NumSelect,
    'date-select': DateSelect,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport,
    DownloadWarning
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
      foreRunMomentMax: this.$moment.utc('2018-09-01 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      modelRun: this.$moment.utc('2018-09-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      forecastPeriod: this.$moment.utc('2018-10-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateConfigs: {
        minimumView: 'month',
        format: 'YYYY-MM',
        placeholder: 'YYYY-MM'
      }
    }
  },
  watch: {
    wcs_id_type: function (newVal, oldVal) {
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
    modelRun: function (newVal, oldVal) {
      this.adjustForePeriod()
    }
  },
  computed: {
    wcs_coverage_id: function () {
      // generate coverageID
      var coverageIdParts = []
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
        'PRES_TT.850': this.$gettext('Air temperature at 850mb'),
        'PRES_UU.200': this.$gettext('Winds at 200mb'),
        'PRES_UU.850': this.$gettext('Winds at 850mb')
      }
    },
    selectedCoverageIdOption: function () {
      var wcsCoverage = {}
      wcsCoverage[this.wcs_coverage_id] = this.variableOptions[this.wcs_id_variable] + ' (' + this.wcs_coverage_id + ')'
      return wcsCoverage
    },
    forecastPeriodMoment: function () {
      return this.$moment.utc(this.forecastPeriod)
    },
    forecastPeriodISO: function () {
      return this.forecastPeriodMoment.toISOString()
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
      return this.modelRunMoment.toISOString()
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
      var foreDate = this.forecastPeriodMoment
      var minimumView = this.dateConfigs.minimumView

      // ignore check if null
      if (this.forePeriodIsEmpty) {
        return false
      }

      return foreDate.isBefore(this.forePeriodMomentRange.min, minimumView) ||
        foreDate.isAfter(this.forePeriodMomentRange.max, minimumView)
    },
    modelRunOutOfRange: function () {
      var modelDate = this.modelRunMoment
      var minimumView = this.dateConfigs.minimumView

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
      var url = this.wcs2_weather_url_base + '&'
      var urlParams = this.getWCSCommonParams(coverageId)

      // Model Run
      var mr = this.modelRunISO
      if (mr !== '' && mr !== null) {
        urlParams.push('DIM_REFERENCE_TIME=' + mr)
      }

      // Forecast Time
      var ft = this.forecastPeriodISO
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
