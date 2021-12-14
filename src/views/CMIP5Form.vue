<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <p v-translate>The Global climate model scenarios dataset is based on an ensemble of global climate model projections from the Coupled Model Intercomparison Project Phase 5 (CMIP5) are provided. Multi-model ensembles of modelled output (actual value) and projected change (anomaly) are available for historical simulations and three emission scenarios at a 1x1 degree grid resolution. Projected changes are expressed as anomalies with respect to the reference period of 1986-2005. A range of percentiles across the multi-model ensembles are available for download.</p>

    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="techDocHtml"></p>

      <open-portal-links
        :open-portal-list-html="openPortalListHtml"
        :open-portal-variables="datasetTitles[$route.name].openPortal.variables"></open-portal-links>
    </details>

    <bbox-map
      v-model="ows_bbox"
      :allow-click-point="true"
      @change="splitBBOXString"></bbox-map>

    <var-select
      v-model="oapicIdVariable"
      :select-options="variableOptions"></var-select>

    <option-radio
      v-model="scenarioType"
      :radio-inline="true"
      :radio-options="scenarioTypeOptions"></option-radio>

    <scenario-select
      v-show="scenarioType === 'projected'"
      v-model="oapicIdScenario"
      :select-options="scenarioOptions"></scenario-select>

    <var-select
      v-model="oapicIdTimePeriod"
      :label="$gettext('Time interval / Time of year')"
      :select-options="timePeriodOptions"></var-select>

    <var-select
      v-model="valueType"
      :label="$gettext('Value type')"
      :select-options="valueTypeOptions"></var-select>

    <var-select
      v-model="percentile"
      :label="$gettext('Ensemble percentile')"
      :info-text="[infoSupportDeskModelOutput, infoPercentile]"
      :select-options="percentileOptions"></var-select>

    <fieldset v-show="!pointClickOn">
      <legend v-translate>Date range</legend>

      <option-radio
        v-model="rangeType"
        :label="$gettext('Time range type')"
        :radio-inline="true"
        :radio-options="rangeTypeOptions"></option-radio>

      <div id="historical-date-range" v-show="scenarioType === 'historical' && rangeType !=='year20'">
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
          id="clear-hist-dates-btn"
          class="btn btn-default"
          type="button"
          @click="clearDates"
          v-translate>Clear dates</button>
      </div>
      <div id="rcp-date-range" v-show="scenarioType === 'projected' && rangeType !=='year20'">
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
          id="clear-dates-btn"
          class="btn btn-default"
          type="button"
          @click="clearDates"
          v-translate>Clear dates</button>
      </div>

      <var-select
        v-show="rangeType === 'year20' && valueType === 'anaomaly'"
        v-model="avg20Year"
        :label="$gettext('20-Year average range')"
        :select-options="avg20YearOptions"></var-select>
    </fieldset>

    <format-select-raster
      class="mrgn-tp-md"
      v-show="!pointClickOn"
      v-model="oapic_format"></format-select-raster>

    <format-select-vector
      class="mrgn-tp-md"
      v-show="pointClickOn"
      v-model="wps_format"></format-select-vector>

    <details
      v-show="!pointClickOn">
      <summary v-translate>Advanced options</summary>
      <var-select
        v-model="ows_crs"
        :label="crsLabel"
        :select-options="crsOptions"></var-select>
    </details>

    <url-box
      v-show="!pointClickOn"
      :layer-options="selectedCoverageIdOption"
      :ows-url-formatter="oapic_download_url"
      :layer-format="oapic_format"
      :wcs-common-url="oapicUrl"
      :wcs-band-chunks="chunkedBandsParam"
      :wcs-num-bands="dateRangeNumBands"
      :band-range-format="bandRangeFormat"
      :has-errors="hasErrors"
      :url-box-title="$gettext('Data download link')">
    </url-box>

    <point-download-box
      v-show="pointClickOn"
      :title="titlePointDownload"
      :hasErrors="invalidPointDownloadInputs"
      :point-inputs="pointInputs" />

    <more-resources></more-resources>
  </section>
</template>

<script>
import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectRaster from '@/components/FormatSelectRaster.vue'
import FormatSelectVector from '@/components/FormatSelectVector.vue'
import VarSelect from '@/components/VarSelect.vue'
import ScenarioSelect from '@/components/ScenarioSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import OptionRadio from '@/components/OptionRadio.vue'
import URLBox from '@/components/URLBox.vue'
import OpenPortalLinks from '@/components/OpenPortalLinks.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import PointDownloadBox from '@/components/PointDownloadBox.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import MoreResources from '@/components/MoreResources.vue'
import { oapiCoverage } from '@/components/mixins/oapi-coverage.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { DCSCMIP5 } from '@/components/mixins/oapi-coverage-dcs-cmip5.js'
import { wps } from '@/components/mixins/wps.js'

export default {
  name: 'CMIP5Form',
  mixins: [oapiCoverage, ows, datasets, DCSCMIP5, wps],
  components: {
    'bbox-map': BBOXMap,
    FormatSelectRaster,
    FormatSelectVector,
    VarSelect,
    ScenarioSelect,
    DateSelect,
    OptionRadio,
    'url-box': URLBox,
    OpenPortalLinks,
    DataAccessDocLink,
    PointDownloadBox,
    TipsUsingTool,
    MoreResources
  },
  data () {
    return {
      oapic_id_dataset: 'CMIP5',
      oapicIdVariable: 'TT',
      oapicIdScenario: 'RCP26',
      oapicIdTimePeriod: 'YEAR',
      avg20YearOptions: {
        '2021-2040': '2021-2040',
        '2041-2060': '2041-2060',
        '2061-2080': '2061-2080',
        '2081-2100': '2081-2100'
      }
    }
  },
  watch: {
    scenarioType: function (newVal) { // overwrites dcs-cmip5 mixin
      // remember last selected RCP if any
      if (this.oapicIdScenario.includes('RCP')) {
        this.lastSelectedRCP = this.oapicIdScenario
      }

      // adjust oapicIdScenario selection for History or Future
      if (newVal === 'historical') {
        this.oapicIdScenario = newVal
        this.rangeType = 'custom'

        // Auto correct dates for Temp and Precip
        if (this.oapicIdVariable === 'TT' || this.oapicIdVariable === 'PR') {
          this.correctDatesTT_PR()
        }
      } else {
        this.oapicIdScenario = this.lastSelectedRCP
      }
    },
    oapicIdTimePeriod: function (newVal) { // overwrites dcs-cmip5 mixin
      // Auto select Absolute and custom time period for Monthly Ensembles
      if (newVal === 'ENS') {
        this.valueType = 'ABS'
        this.rangeType = 'custom'

        // Auto correct dates for wind selection
        if (this.oapicIdVariable === 'SFCWIND') {
          this.correctDatesSFCWIND()
        } else if (this.oapicIdVariable === 'SND') { // some variables not yet supported for non-monthly ABS; auto correct selection
          // this.valueType = 'anomaly'
        }
      }
      // adjust dates if they are strings to match new date format
      this.dateRcpStart = this.formatDateToMoment(this.dateRcpStart).format(this.dateConfigs.format)
      this.dateRcpEnd = this.formatDateToMoment(this.dateRcpEnd).format(this.dateConfigs.format)
    },
    oapicIdVariable: function (newVal) {
      // Auto correct dates for Temp and Precip
      if (newVal === 'TT' || newVal === 'PR') {
        this.correctDatesTT_PR()
      }

      // some variables not yet supported for non-monthly ABS; auto correct selectio
      if (newVal === 'SND') {
        if (this.valueType === 'ABS' && this.oapicIdTimePeriod !== 'ENS') {
          // this.oapicIdTimePeriod = 'ENS'
          this.valueType = 'anomaly'
        }
      }

      // Auto correct dates for monthly wind
      if (this.oapicIdTimePeriod === 'ENS') {
        if (newVal === 'SFCWIND') {
          this.correctDatesSFCWIND()
        }
      }
    },
    rangeType: function (newVal) {
      // Force percentile to 50th
      if (newVal === 'year20') {
        this.percentile = 'PCTL50'
      }
    },
    valueType: function (newVal) {
      if (newVal === 'ABS') {
        this.rangeType = 'custom'

        // Some variables not yet supported for non-monthly ABS; auto correct selection
        if (this.oapicIdVariable === 'SND') {
          this.oapicIdTimePeriod = 'ENS'
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
      if (this.oapicIdVariable === 'TT' || this.oapicIdVariable === 'PR') {
        return this.$moment.utc('1901-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    dateHistMax: function () {
      if (this.oapicIdTimePeriod === 'ENS' && this.oapicIdVariable === 'SFCWIND') {
        return this.$moment.utc('2005-11-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('2005-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    specialErrorMsg: function () {
      // Special case checks for certain selection criteria
      let historicalYearStart = ''
      let historicalYearEnd = ''

      // special case for Monthly surface wind dates
      if (this.bandHistoricalYearStart >= this.historicalMax.year && this.bandHistoricalMonthStart > this.historicalMax.month && this.oapicIdTimePeriod === 'ENS' && this.oapicIdVariable === 'SFCWIND') {
        historicalYearStart = this.$gettext('Maximum date for near surface wind speed is:') + ' ' + this.historicalMax.year + '-' + this.historicalMax.month
      }
      if (this.bandHistoricalYearEnd >= this.historicalMax.year && this.bandHistoricalMonthEnd > this.historicalMax.month && this.oapicIdTimePeriod === 'ENS' && this.oapicIdVariable === 'SFCWIND') {
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
