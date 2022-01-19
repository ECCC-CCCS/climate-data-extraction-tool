<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <p v-translate>The Statistically downscaled climate scenarios dataset provides projected changes in temperature and precipitation, with respect to the reference period of 1986-2005, for three emission scenarios at a 10km resolution. Downscaled data are based on global climate model projections from the Coupled Model Intercomparison Project Phase 5 (CMIP5). The median projected changes across the downscaled multi-model ensemble are shown.</p>

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
      v-model="mapBBOX"
      :allow-click-point="true"
      :file-formats="fileFormats"
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
      :info-text="[infoDailyData]"
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
      :formats="fileFormats"
      :info-text="[infoSupportDeskGridPoint]"></format-select-file>

    <format-select-vector
      class="mrgn-tp-md"
      v-show="pointClickOn"
      v-model="wps_format"></format-select-vector>

    <data-download-box
      v-show="!pointClickOn"
      :file-name="filename"
      :file-format="oapicFormat"
      :download-url="oapicUrl"
      :download-context="downloadContext"
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
  name: 'DCSForm',
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
      oapicIdDataset: 'DCS',
      oapicIdVariable: 'tm'
    }
  },
  computed: {
    ...mapState('map', [
      'clickLatLng'
    ]),
    variableOptions: function () {
      return {
        tm: this.$gettext('Mean temperature'),
        tn: this.$gettext('Minimum temperature'),
        tx: this.$gettext('Maximum temperature'),
        pr: this.$gettext('Total precipitation')
      }
    },
    pointInputs: function () {
      const varToLayerVar = {
        tm: 'TM',
        tn: 'TN',
        tx: 'TX',
        pr: 'PR'
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
