<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <p>{{ introDatasetText.gridded.use }}</p>
        <p>{{ introDatasetText.gridded.instructions }}</p>

        <data-access-doc-link></data-access-doc-link>

        <details :open="toggleDetailsState">
          <summary @click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>The Global climate model scenarios dataset is based on an ensemble of global climate model projections from the Coupled Model Intercomparison Project Phase 5 (CMIP5) are provided. Multi-model ensembles of modelled output (actual value) and projected change (anomaly) are available for historical simulations and three emission scenarios at a 1x1 degree grid resolution. Projected changes are expressed as anomalies with respect to the reference period of 1986-2005. A range of percentiles across the multi-model ensembles are available for download.</p>

          <p v-html="techDocHtml"></p>

          <open-portal-links
            :open-portal-list-html="openPortalListHtml"
            :open-portal-variables="datasetTitles[$route.name].openPortal.variables"></open-portal-links>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          :allow-click-point="true"
          @change="splitBBOXString"></bbox-map>

        <var-select
          v-model="wcs_id_variable"
          :select-options="variableOptions"></var-select>

        <option-radio
          v-model="scenarioType"
          :radio-inline="true"
          :radio-options="scenarioTypeOptions"></option-radio>

        <scenario-select
          v-show="scenarioType === 'RCP'"
          v-model="wcs_id_scenario"
          :select-options="scenarioOptions"></scenario-select>

        <var-select
          v-model="wcs_id_timePeriod"
          :label="$gettext('Time interval / Time of year')"
          :select-options="timePeriodOptions"></var-select>

        <var-select
          v-model="valueType"
          :label="$gettext('Value type')"
          :select-options="valueTypeOptions"></var-select>

        <var-select
          v-model="percentile"
          :label="$gettext('Ensemble percentile')"
          :info-text="[infoModelOutput, infoPercentile]"
          :select-options="percentileOptions"></var-select>

        <fieldset v-show="!pointDownloadOn">
          <legend v-translate>Date range</legend>

          <option-radio
            v-model="rangeType"
            :label="$gettext('Time range type')"
            :radio-inline="true"
            :radio-options="rangeTypeOptions"></option-radio>

          <div v-show="scenarioType === 'HISTO' && rangeType !=='year20'">
            <date-select
              v-model="dateHistStart"
              :label="$gettext('Historical start date')"
              :minimum-view="dateConfigs.minimumView"
              :format="dateConfigs.format"
              :required="timePeriodIsMonthly"
              :min-date="dateConfigs.dateMin"
              :max-date="dateConfigs.dateMax"
              :custom-error-msg="dateRangeErrorMessage"
              :placeholder="dateConfigs.placeholder"></date-select>

            <date-select
              v-model="dateHistEnd"
              :label="$gettext('Historical end date')"
              :minimum-view="dateConfigs.minimumView"
              :format="dateConfigs.format"
              :required="timePeriodIsMonthly"
              :min-date="dateConfigs.dateMin"
              :max-date="dateConfigs.dateMax"
              :custom-error-msg="dateRangeErrorMessage"
              :placeholder="dateConfigs.placeholder"></date-select>

            <button
              class="btn btn-default"
              type="button"
              @click="clearDates"
              v-translate>Clear dates</button>
          </div>
          <div v-show="scenarioType === 'RCP' && rangeType !=='year20'">
            <date-select
              v-model="dateRcpStart"
              :label="$gettext('Start date')"
              :minimum-view="dateConfigs.minimumView"
              :format="dateConfigs.format"
              :required="timePeriodIsMonthly"
              :min-date="dateConfigs.dateMin"
              :max-date="dateConfigs.dateMax"
              :custom-error-msg="dateRangeErrorMessage"
              :placeholder="dateConfigs.placeholder"></date-select>

            <date-select
              v-model="dateRcpEnd"
              :label="$gettext('End date')"
              :minimum-view="dateConfigs.minimumView"
              :format="dateConfigs.format"
              :required="timePeriodIsMonthly"
              :min-date="dateConfigs.dateMin"
              :max-date="dateConfigs.dateMax"
              :custom-error-msg="dateRangeErrorMessage"
              :placeholder="dateConfigs.placeholder"></date-select>

            <button
              class="btn btn-default"
              type="button"
              @click="clearDates"
              v-translate>Clear dates</button>
          </div>

          <var-select
            v-show="rangeType === 'year20' && valueType === 'ANO'"
            v-model="avg20Year"
            :label="$gettext('20-Year average range')"
            :select-options="avg20YearOptions"></var-select>
        </fieldset>

        <format-select-raster
          class="mrgn-tp-md"
          v-show="!pointDownloadOn"
          v-model="wcs_format"
          :info-text="[infoSupportDeskGridPoint]"></format-select-raster>

        <format-select-vector
          class="mrgn-tp-md"
          v-show="pointDownloadOn"
          v-model="wps_format"></format-select-vector>

        <details
          :open="toggleDetailsAdvState"
          v-show="!pointDownloadOn">
          <summary @click="toggleDetailsAdv"
            v-translate>Advanced options</summary>
          <var-select
            v-model="ows_crs"
            :label="crsLabel"
            :select-options="crsOptions"></var-select>
        </details>

        <url-box
          v-show="!pointDownloadOn"
          :layer-options="selectedCoverageIdOption"
          :ows-url-formatter="wcs_download_url"
          :layer-format="wcs_format"
          :wcs-common-url="wcsCommonUrl"
          :wcs-band-chunks="chunkedBandsParam"
          :wcs-num-bands="dateRangeNumBands"
          :band-range-format="bandRangeFormat"
          :has-errors="hasErrors"
          :url-box-title="$gettext('Data download link')">
        </url-box>

        <point-download-box
          v-show="pointDownloadOn"
          :title="titlePointDownload"
          :hasErrors="invalidPointDownloadInputs"
          :point-inputs="pointInputs" />
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from './DatasetMenu'
import BBOXMap from './BBOXMap'
import FormatSelectRaster from './FormatSelectRaster'
import FormatSelectVector from './FormatSelectVector'
import VarSelect from './VarSelect'
import ScenarioSelect from './ScenarioSelect'
import DateSelect from './DateSelect'
import OptionRadio from './OptionRadio'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import OpenPortalLinks from './OpenPortalLinks'
import DataAccessDocLink from './DataAccessDocLink'
import PointDownloadBox from './PointDownloadBox'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'
import { DCSCMIP5 } from './mixins/dcs-cmip5'
import { wps } from './mixins/wps'

export default {
  name: 'CMIP5Form',
  mixins: [wcs, ows, datasets, DCSCMIP5, wps],
  components: {
    DatasetMenu,
    'bbox-map': BBOXMap,
    FormatSelectRaster,
    FormatSelectVector,
    VarSelect,
    ScenarioSelect,
    DateSelect,
    OptionRadio,
    'url-box': URLBox,
    InfoContactSupport,
    OpenPortalLinks,
    DataAccessDocLink,
    PointDownloadBox
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
    scenarioType: function (newVal, oldVal) { // overwrites dcs-cmip5 mixin
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
    wcs_id_timePeriod: function (newVal, oldVal) { // overwrites dcs-cmip5 mixin
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'ENS') {
        this.valueType = 'ABS'
        this.rangeType = 'custom'

        // Auto correct dates for wind selection
        if (this.wcs_id_variable === 'SFCWIND') {
          this.correctDatesSFCWIND()
        } else if (this.wcs_id_variable === 'SND') { // some variables not yet supported for non-monthly ABS; auto correct selection
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

      // some variables not yet supported for non-monthly ABS; auto correct selectio
      if (newVal === 'SND') {
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

        // Some variables not yet supported for non-monthly ABS; auto correct selection
        if (this.wcs_id_variable === 'SND') {
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
