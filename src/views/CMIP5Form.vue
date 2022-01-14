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
      v-model="oapicScenario"
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

      <div id="historical-date-range" v-show="scenarioType === 'historical' && rangeType !=='P20Y-Avg'">
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
      <div id="rcp-date-range" v-show="scenarioType === 'projected' && rangeType !=='P20Y-Avg'">
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
        v-show="rangeType === 'P20Y-Avg' && valueType === 'anomaly'"
        v-model="avg20Year"
        :label="$gettext('20-Year average range')"
        :select-options="avg20YearOptions"></var-select>
    </fieldset>

    <format-select-file
      class="mrgn-tp-md"
      v-show="!pointClickOn"
      v-model="oapicFormat"
      :formats="fileFormats"></format-select-file>

    <format-select-vector
      class="mrgn-tp-md"
      v-show="pointClickOn"
      v-model="wps_format"></format-select-vector>

    <data-download-box
      v-show="!pointClickOn"
      :file-name="filename"
      :file-format="oapicFormat"
      :download-url="oapicUrl"
      :date-range-chunks="downloadLinkTitleBreakdown"
      :band-range-format="bandRangeFormat"
      :has-errors="hasErrors">
    </data-download-box>

    <point-download-box
      v-show="pointClickOn"
      :title="titlePointDownload"
      :hasErrors="invalidPointDownloadInputs"
      :point-inputs="pointInputs" />

    <more-resources></more-resources>
  </section>
</template>

<script>
import { mapState } from "vuex"

import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectFile from '@/components/FormatSelectFile.vue'
import FormatSelectVector from '@/components/FormatSelectVector.vue'
import VarSelect from '@/components/VarSelect.vue'
import ScenarioSelect from '@/components/ScenarioSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import OptionRadio from '@/components/OptionRadio.vue'
import DataDownloadBox from '@/components/DataDownloadBox.vue'
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
    FormatSelectFile,
    FormatSelectVector,
    VarSelect,
    ScenarioSelect,
    DateSelect,
    OptionRadio,
    DataDownloadBox,
    OpenPortalLinks,
    DataAccessDocLink,
    PointDownloadBox,
    TipsUsingTool,
    MoreResources
  },
  data () {
    return {
      oapicIdDataset: 'CMIP5',
      oapicIdVariable: 'tas'
    }
  },
  watch: {
    oapicIdVariable: function (newVal) {
      // Auto correct dates for Temp and Precip
      if (newVal === 'tas' || newVal === 'pr') {
        this.correctDatestas_pr()
      }

      // some variables not yet supported for non-monthly absolute; auto correct selectio
      if (newVal === 'snd') {
        if (this.valueType === 'absolute' && this.oapicIdTimePeriod !== 'monthly') {
          // this.oapicIdTimePeriod = 'monthly'
          this.valueType = 'anomaly'
        }
      }

      // Auto correct dates for monthly wind
      if (this.oapicIdTimePeriod === 'monthly') {
        if (newVal === 'sfcWind') {
          this.correctDatessfcWind()
        }
      }
    }
  },
  methods: {
    correctDatestas_pr: function () {
      if (this.bandMoments.histStart.isBefore(this.$moment.utc(this.dateHistMin))) {
        this.dateHistStart = this.$moment.utc(this.dateHistMin).toDate()
      }
    },
    correctDatessfcWind: function () {
      if (this.bandMoments.histEnd.isAfter(this.$moment.utc(this.dateHistMax))) {
        this.dateHistEnd = this.$moment.utc(this.dateHistMax).toDate()
      }
    }
  },
  computed: {
    ...mapState('map', [
      'clickLatLng'
    ]),
    variableOptions: function () {
      return {
        tas: this.$gettext('Mean temperature'),
        pr: this.$gettext('Mean precipitation'),
        snd: this.$gettext('Snow depth'),
        sit: this.$gettext('Sea ice thickness'),
        sic: this.$gettext('Sea ice concentration'),
        sfcWind: this.$gettext('Near surface wind speed')
      }
    },
    dateHistMin: function () {
      if (this.oapicIdVariable === 'tas' || this.oapicIdVariable === 'pr') {
        return this.$moment.utc('1901-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      } else {
        return this.$moment.utc('1900-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
      }
    },
    dateHistMax: function () {
      if (this.oapicIdTimePeriod === 'monthly' && this.oapicIdVariable === 'sfcWind') {
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
      if (this.bandHistoricalYearStart >= this.historicalMax.year && this.bandHistoricalMonthStart > this.historicalMax.month && this.oapicIdTimePeriod === 'monthly' && this.oapicIdVariable === 'sfcWind') {
        historicalYearStart = this.$gettext('Maximum date for near surface wind speed is:') + ' ' + this.historicalMax.year + '-' + this.historicalMax.month
      }
      if (this.bandHistoricalYearEnd >= this.historicalMax.year && this.bandHistoricalMonthEnd > this.historicalMax.month && this.oapicIdTimePeriod === 'monthly' && this.oapicIdVariable === 'sfcWind') {
        historicalYearEnd = this.$gettext('Maximum date for near surface wind speed is:') + ' ' + this.historicalMax.year + '-' + this.historicalMax.month
      }

      return {
        historicalYearStart: historicalYearStart,
        historicalYearEnd: historicalYearEnd
      }
    },
    pointInputs: function () {
      const varToLayerVar = {
        tas: 'TT',
        pr: 'PR',
        snd: 'SND',
        sit: 'SIT',
        sic: 'SIC',
        sfcWind: 'SFCWIND'
      }
      const timeToLayerTime = {
        MAM: 'SPRING',
        JJA: 'SUMMER',
        SON: 'FALL',
        DJF: 'WINTER',
        annual: 'YEAR',
        monthly: 'ENS'
      }
      let layer = this.oapicIdDataset + '.' + varToLayerVar[this.oapicIdVariable] + '.' + this.oapicScenario.replace('.', '') + '.' + timeToLayerTime[this.oapicIdTimePeriod] + '.PCTL' + this.percentile
      return {
        layer: layer,
        y: this.clickLatLng === null ? null : this.clickLatLng.lat,
        x: this.clickLatLng === null ? null : this.clickLatLng.lng,
        format: this.wps_format
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
