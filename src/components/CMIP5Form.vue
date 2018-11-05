<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

        <p>{{ introDatasetText.gridded.use }}</p>
        <p>{{ introDatasetText.gridded.instructions }}</p>

        <details v-bind:open="toggleDetailsState">
          <summary v-on:click="toggleDetails"
            v-translate>Dataset description</summary>
          <p v-translate>Climate scenarios based on an ensemble of global climate model projections from the Coupled Model Intercomparison Project Phase 5 (CMIP5) are provided. Multi-model ensembles of modelled output (actual value) and projected change (anomaly) are available for historical simulations and three emission scenarios at a 1x1 degree grid resolution. Projected changes are expressed as anomalies with respect to the reference period of 1986-2005. A range of percentiles across the multi-model ensembles are available for download.</p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-on:change="splitBBOXString"></bbox-map>

        <var-select
          v-model="wcs_id_variable"
          v-bind:select-options="variableOptions"></var-select>

        <option-radio
          v-model="scenarioType"
          v-bind:initial-value="scenarioType"
          v-bind:radio-inline="true"
          v-bind:radio-options="scenarioTypeOptions"></option-radio>

        <scenario-select
          v-show="scenarioType === 'RCP'"
          v-model="wcs_id_scenario"
          v-bind:select-options="scenarioOptions"></scenario-select>

        <var-select
          v-model="wcs_id_timePeriod"
          v-bind:label="$gettext('Time interval / Time of year')"
          v-bind:select-options="timePeriodOptions"></var-select>

        <var-select
          v-model="valueType"
          v-bind:label="$gettext('Value type')"
          v-bind:select-options="valueTypeOptions"></var-select>

        <var-select
          v-model="percentile"
          v-bind:label="$gettext('Ensemble percentile')"
          v-bind:info-text="[infoModelOutput, infoPercentile]"
          v-bind:select-options="percentileOptions"></var-select>

        <fieldset>
          <legend v-translate>Date range</legend>

          <option-radio
            v-model="rangeType"
            v-bind:initial-value="rangeType"
            v-bind:label="$gettext('Time range type')"
            v-bind:radio-inline="true"
            v-bind:radio-options="rangeTypeOptions"></option-radio>

          <div v-show="scenarioType === 'HISTO' && rangeType !=='year20'">
            <date-select
              v-model="dateHistStart"
              v-bind:label="$gettext('Historical start date')"
              v-bind:minimum-view="dateConfigs.minimumView"
              v-bind:format="dateConfigs.format"
              v-bind:min-date="dateConfigs.dateMin"
              v-bind:max-date="dateConfigs.dateMax"
              v-bind:custom-error-msg="dateRangeErrorMessage"
              v-bind:placeholder="dateConfigs.placeholder"></date-select>

            <date-select
              v-model="dateHistEnd"
              v-bind:label="$gettext('Historical end date')"
              v-bind:minimum-view="dateConfigs.minimumView"
              v-bind:format="dateConfigs.format"
              v-bind:min-date="dateConfigs.dateMin"
              v-bind:max-date="dateConfigs.dateMax"
              v-bind:custom-error-msg="dateRangeErrorMessage"
              v-bind:placeholder="dateConfigs.placeholder"></date-select>

            <button
              class="btn btn-default"
              type="button"
              v-on:click="clearDates"
              v-translate>Clear dates</button>
          </div>
          <div v-show="scenarioType === 'RCP' && rangeType !=='year20'">
            <date-select
              v-model="dateRcpStart"
              v-bind:label="$gettext('Start date')"
              v-bind:minimum-view="dateConfigs.minimumView"
              v-bind:format="dateConfigs.format"
              v-bind:min-date="dateConfigs.dateMin"
              v-bind:max-date="dateConfigs.dateMax"
              v-bind:custom-error-msg="dateRangeErrorMessage"
              v-bind:placeholder="dateConfigs.placeholder"></date-select>

            <date-select
              v-model="dateRcpEnd"
              v-bind:label="$gettext('End date')"
              v-bind:minimum-view="dateConfigs.minimumView"
              v-bind:format="dateConfigs.format"
              v-bind:min-date="dateConfigs.dateMin"
              v-bind:max-date="dateConfigs.dateMax"
              v-bind:custom-error-msg="dateRangeErrorMessage"
              v-bind:placeholder="dateConfigs.placeholder"></date-select>

            <button
              class="btn btn-default"
              type="button"
              v-on:click="clearDates"
              v-translate>Clear dates</button>
          </div>

          <var-select
            v-show="rangeType === 'year20' && valueType === 'ANO'"
            v-model="avg20Year"
            v-bind:label="$gettext('20-Year average range')"
            v-bind:select-options="avg20YearOptions"></var-select>
        </fieldset>

        <format-select-raster
          class="mrgn-tp-md"
          v-model="wcs_format"
          v-bind:info-text="[infoSupportDeskGridPoint]"></format-select-raster>

        <details v-bind:open="toggleDetailsAdvState">
          <summary v-on:click="toggleDetailsAdv"
            v-translate>Advanced options</summary>
          <var-select
            v-model="ows_crs"
            v-bind:label="crsLabel"
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
import ScenarioSelect from './ScenarioSelect'
import DateSelect from './DateSelect'
import OptionRadio from './OptionRadio'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'
import { DCSCMIP5 } from './mixins/dcs-cmip5'

export default {
  name: 'CMIP5Form',
  mixins: [wcs, ows, datasets, DCSCMIP5],
  components: {
    'dataset-menu': DatasetMenu,
    'bbox-map': BBOXMap,
    'format-select-raster': FormatSelectRaster,
    'var-select': VarSelect,
    'scenario-select': ScenarioSelect,
    'date-select': DateSelect,
    'option-radio': OptionRadio,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport
  },
  data () {
    return {
      wcs_id_dataset: 'CMIP5',
      wcs_id_variable: 'TT',
      avg20YearOptions: {
        '2021-2040': '2021-2040',
        '2041-2060': '2041-2060',
        '2061-2080': '2061-2080',
        '2081-2100': '2081-2100'
      }
    }
  },
  watch: {
    scenarioType: function (newVal, oldVal) {
      // remember last selected RCP if any
      if (this.wcs_id_scenario.includes('RCP')) {
        this.lastSelectedRCP = this.wcs_id_scenario
      }

      // adjust wcs_id_scenario selection for History or Future
      if (newVal === 'HISTO') {
        this.wcs_id_scenario = newVal
        this.rangeType = 'custom'

        // Auto correct dates for Temp and Precip
        if (this.wcs_id_variable === 'TT' || this.wcs_id_variable === 'PR') {
          this.correctDatesTT_PR()
        }
      } else {
        this.wcs_id_scenario = this.lastSelectedRCP
      }
    },
    wcs_id_timePeriod: function (newVal, oldVal) {
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'ENS') {
        this.valueType = 'ABS'
        this.rangeType = 'custom'

        // Auto correct dates for wind selection
        if (this.wcs_id_variable === 'SFCWIND') {
          this.correctDatesSFCWIND()
          this.valueType = 'ANO'
        } else if (this.wcs_id_variable === 'SIT' || this.wcs_id_variable === 'SIC' || this.wcs_id_variable === 'SND') { // SIC and SIT not yet supported for non-monthly ABS; auto correct selection
          this.valueType = 'ANO'
        }
      }
      // adjust dates if they are strings to match new date format
      this.dateRcpStart = this.formatDateToMoment(this.dateRcpStart).format(this.dateConfigs.format)
      this.dateRcpEnd = this.formatDateToMoment(this.dateRcpEnd).format(this.dateConfigs.format)
    },
    wcs_id_variable: function (newVal, oldVal) {
      // Auto correct dates for Temp and Precip
      if (newVal === 'TT' || newVal === 'PR') {
        this.correctDatesTT_PR()
      }

      // SIC and SIT not yet supported for non-monthly ABS; auto correct selectio
      if (newVal === 'SIT' || newVal === 'SIC' || newVal === 'SND' || newVal === 'SFCWIND') {
        if (this.valueType === 'ABS' && this.wcs_id_timePeriod !== 'ENS') {
          // this.wcs_id_timePeriod = 'ENS'
          this.valueType = 'ANO'
        }
      }

      // Auto correct dates for monthly wind
      if (this.wcs_id_timePeriod === 'ENS') {
        if (newVal === 'SFCWIND') {
          this.correctDatesSFCWIND()
        }
      }
    },
    rangeType: function (newVal, oldVal) {
      // Force percentile to 50th
      if (newVal === 'year20') {
        this.percentile = 'PCTL50'
      }
    },
    valueType: function (newVal, oldVal) {
      if (newVal === 'ABS') {
        this.rangeType = 'custom'

        // SIC and SIT not yet supported for non-monthly ABS; auto correct selection
        if (this.wcs_id_variable === 'SIT' || this.wcs_id_variable === 'SIC' || this.wcs_id_variable === 'SND' || this.wcs_id_variable === 'SFCWIND') {
          this.wcs_id_timePeriod = 'ENS'
        }
      }
    }
  },
  methods: {
    correctDatesTT_PR: function () {
      if (this.bandMoments.histStart.isBefore(this.$moment.utc(this.dateHistMin))) {
        this.dateHistStart = this.$moment.utc(this.dateHistMin).toDate()
      }
    },
    correctDatesSFCWIND: function () {
      if (this.bandMoments.histEnd.isAfter(this.$moment.utc(this.dateHistMax))) {
        this.dateHistEnd = this.$moment.utc(this.dateHistMax).toDate()
      }
    }
  },
  computed: {
    percentileOptions: function () {
      if (this.rangeType === 'year20') {
        return {
          PCTL50: this.$gettext('50th percentile')
        }
      } else {
        return {
          PCTL5: this.$gettext('5th percentile'),
          PCTL25: this.$gettext('25th percentile'),
          PCTL50: this.$gettext('50th percentile'),
          PCTL75: this.$gettext('75th percentile'),
          PCTL95: this.$gettext('95th percentile')
        }
      }
    },
    variableOptions: function () {
      return {
        TT: this.$gettext('Mean temperature'),
        PR: this.$gettext('Mean precipitation'),
        SND: this.$gettext('Snow depth'),
        SIT: this.$gettext('Sea ice thickness'),
        SIC: this.$gettext('Sea ice concentration'),
        SFCWIND: this.$gettext('Near surface wind speed')
      }
    },
    dateHistMin: function () {
      if (this.wcs_id_variable === 'TT' || this.wcs_id_variable === 'PR') {
        return this.$moment.utc('1901-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    dateHistMax: function () {
      if (this.wcs_id_timePeriod === 'ENS' && this.wcs_id_variable === 'SFCWIND') {
        return this.$moment.utc('2005-11-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('2005-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    specialErrorMsg: function () {
      // Special case checks for certain selection criteria
      var historicalYearStart = ''
      var historicalYearEnd = ''

      // special case for Monthly surface wind dates
      if (this.bandHistoricalYearStart >= this.historicalMax.year && this.bandHistoricalMonthStart > this.historicalMax.month && this.wcs_id_timePeriod === 'ENS' && this.wcs_id_variable === 'SFCWIND') {
        historicalYearStart = this.$gettext('Maximum date for near surface wind speed is:') + ' ' + this.historicalMax.year + '-' + this.historicalMax.month
      }
      if (this.bandHistoricalYearEnd >= this.historicalMax.year && this.bandHistoricalMonthEnd > this.historicalMax.month && this.wcs_id_timePeriod === 'ENS' && this.wcs_id_variable === 'SFCWIND') {
        historicalYearEnd = this.$gettext('Maximum date for near surface wind speed is:') + ' ' + this.historicalMax.year + '-' + this.historicalMax.month
      }

      return {
        historicalYearStart: historicalYearStart,
        historicalYearEnd: historicalYearEnd
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
