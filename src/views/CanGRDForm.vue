<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-translate>Canadian gridded temperature and precipitation anomalies (CANGRD) are datasets of historical gridded temperature and precipitation anomalies, interpolated from adjusted and homogenized climate station data at a 50km resolution across Canada. Mean, minimum and maximum temperature and total precipitation anomalies represent the departure from a mean reference period (1961-1990). Temperature anomalies are expressed as degree Celsius (C) while precipitation anomalies are normalized by dividing by the mean reference period and expressed as percentage change (%). Trends of temperature change (C) for 1948-2018 and trends of relative total precipitation change (%) for 1948-2012 are also available for download.</p>

    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Technical information and metadata</summary>
      <p v-translate>Canadian gridded temperature and precipitation anomalies (CANGRD) are datasets of historical gridded temperature and precipitation anomalies, interpolated from adjusted and homogenized climate station data at a 50km resolution across Canada. Mean, minimum and maximum temperature and total precipitation anomalies represent the departure from a mean reference period (1961-1990). Temperature anomalies are expressed as degree Celsius (C) while precipitation anomalies are normalized by dividing by the mean reference period and expressed as percentage change (%). Trends of temperature change (C) for 1948-2018 and trends of relative total precipitation change (%) for 1948-2012 are also available for download.</p>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>
    </details>

    <bbox-map
      v-model="ows_bbox"
      :allow-click-point="true"
      @change="splitBBOXString"></bbox-map>
    <var-select
      v-model="oapicValueType"
      :label="$gettext('Value type')"
      :select-options="variableTypeOptions"></var-select>

    <var-select
      v-model="oapicIdVariable"
      :label="$gettext('Variable')"
      :select-options="variableOptions"></var-select>

    <var-select
      v-model="oapicIdTimePeriod"
      :label="$gettext('Time interval / Time of year')"
      :select-options="timePeriodOptions"></var-select>

    <fieldset v-show="!pointClickOn">
      <legend v-translate>Date range</legend>
      <div v-show="oapicValueType === 'anomaly'">
        <date-select
          v-model="date_start"
          :label="$gettext('Start date')"
          :minimum-view="dateConfigs.minimumView"
          :format="dateConfigs.format"
          :required="timePeriodIsMonthly"
          :min-date="dateConfigs.dateMin"
          :max-date="dateConfigs.dateMax"
          :custom-error-msg="dateRangeErrorMessage"
          :placeholder="dateConfigs.placeholder"></date-select>

        <date-select
          v-model="date_end"
          :disabled="oapicFormat === 'json'"
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
    </fieldset>

    <div
      id="info-date-not-required-trends"
      v-show="oapicValueType !== 'anomaly'"
      class="alert alert-info">
      <p v-translate>Date ranges not required for CanGRD trends</p>
    </div>

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
      :date-range-chunks="dateRangeParams"
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
import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectFile from '@/components/FormatSelectFile.vue'
import FormatSelectVector from '@/components/FormatSelectVector.vue'
import VarSelect from '@/components/VarSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import DataDownloadBox from '@/components/DataDownloadBox.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import PointDownloadBox from '@/components/PointDownloadBox.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import MoreResources from '@/components/MoreResources.vue'
import { ows } from '@/components/mixins/ows.js'
import { oapiCoverage } from '@/components/mixins/oapi-coverage.js'
import { datasets } from '@/components/mixins/datasets.js'
import { wps } from '@/components/mixins/wps.js'

export default {
  name: 'CanGRDForm',
  mixins: [oapiCoverage, ows, datasets, wps],
  components: {
    'bbox-map': BBOXMap,
    FormatSelectFile,
    VarSelect,
    DateSelect,
    DataAccessDocLink,
    PointDownloadBox,
    FormatSelectVector,
    TipsUsingTool,
    MoreResources,
    DataDownloadBox
  },
  data () {
    return {
      wcs_id: '',
      oapicIdDataset: 'CanGRD',
      oapicIdVariable: 'tmean',
      oapicValueType: 'anomaly',
      oapicScenarioType: 'historical',
      oapicIdTimePeriod: 'annual',
      oapicFormat: 'json',
      ows_bbox: '-154,38,-49,81',
      date_start: this.$moment.utc('1948-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_end: this.$moment.utc('2018-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_min: this.$moment.utc('1948-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_max: this.$moment.utc('2018-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_max_pcp: this.$moment.utc('2014-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
    }
  },
  watch: {
    oapicValueType: function () {
      // reset unsupported selections for trend
      if (this.oapicValueType === 'trend') {
        // autocorrect dependent selections to the first option for trend
        if (!(this.oapicIdVariable in this.variableOptions)) {
          this.oapicIdVariable = Object.keys(this.variableOptions)[0]
        }
        if (!(this.oapicIdTimePeriod in this.timePeriodOptions)) {
          this.oapicIdTimePeriod = Object.keys(this.timePeriodOptions)[0]
        }
      }
    },
    oapicIdVariable: function () {
      // Auto adjust start/end dates if goes over maximum range
      if (this.dateStartMoment.isAfter(this.dateConfigs.dateMax, this.dateConfigs.minimumView)) {
        this.date_start = this.dateConfigs.dateMax
      }
      if (this.dateEndMoment.isAfter(this.dateConfigs.dateMax, this.dateConfigs.minimumView)) {
        this.date_end = this.dateConfigs.dateMax
      }
    },
    date_start: function (newStartDate) {
      // Auto adjust date end because date range not supported in covJson
      if (this.oapicFormat === 'json') {
        this.date_end = newStartDate
      }
    }
  },
  computed: {
    oapicCoverageId: function () {
      return 'climate:' + this.oapicIdDataset + ':' + this.oapicScenarioType + ':' + this.timePeriodType + ':' + this.oapicValueType
    },
    oapicDatetime: function() {
      if (this.oapicFormat === 'json') { // date range not supported in covJson
        return this.dateStartFormatted // single date
      } else if (this.dateEndFormatted === this.dateStartFormatted) {
        return this.dateStartFormatted // single date
      } else {
        return `${this.dateStartFormatted}/${this.dateEndFormatted}`
      }
    },
    dateRangeParams: function () {
      return [{
        specialTitle: `${this.variableOptions[this.oapicIdVariable]} | ${this.timePeriodOptions[this.oapicIdTimePeriod]} | ${this.variableTypeOptions[this.oapicValueType]} | ${this.oapicDatetime}`
      }]
    },
    timePeriodType: function () {
      if (['annual', 'monthly'].includes(this.oapicIdTimePeriod)) {
        return this.oapicIdTimePeriod
      } else {
        return 'seasonal'
      }
    },
    dateStartMoment: function () {
      return this.$moment.utc(this.date_start, this.dateConfigs.format)
    },
    dateEndMoment: function () {
      return this.$moment.utc(this.date_end, this.dateConfigs.format)
    },
    dateStartFormatted: function () {
      return this.dateStartMoment.format(this.dateConfigs.format)
    },
    dateEndFormatted: function () {
      return this.dateEndMoment.format(this.dateConfigs.format)
    },
    bandsInRange: function () {
      return this.checkDatesInRange(this.dateStartFormatted, this.dateEndFormatted)
    },
    bandStartIsEmptyOnly: function () {
      return this.checkDateStartIsEmptyOnly(this.dateStartFormatted, this.dateEndFormatted)
    },
    bandEndIsEmptyOnly: function () {
      return this.checkDateEndIsEmptyOnly(this.dateStartFormatted, this.dateEndFormatted)
    },
    dateRangePastLimits: function () {
      let start = this.$moment.utc(this.date_start, this.dateConfigs.format)
      let end = this.$moment.utc(this.date_end, this.dateConfigs.format)
      let minimumView = this.dateConfigs.minimumView

      return start.isBefore(this.dateConfigs.dateMin, minimumView) ||
        start.isAfter(this.dateConfigs.dateMax, minimumView) ||
        end.isBefore(this.dateConfigs.dateMin, minimumView) ||
        end.isAfter(this.dateConfigs.dateMax, minimumView)
    },
    variableOptions: function () {
      if (this.oapicValueType === 'anomaly') {
        return {
          'tmean': this.$gettext('Mean temperature'),
          'tmin': this.$gettext('Minimum temperature'),
          'tmax': this.$gettext('Maximum temperature'),
          'pcp': this.$gettext('Total precipitation')
        }
      } else { // Trends
        return {
          'tmean': this.$gettext('Mean temperature'),
          'pcp': this.$gettext('Total precipitation')
        }
      }
    },
    timePeriodOptions: function () {
      if (this.oapicValueType === 'anomaly') {
        return {
          monthly: this.$gettext('Monthly'),
          MAM: this.$gettext('Spring (March-May)'),
          JJA: this.$gettext('Summer (June-August)'),
          SON: this.$gettext('Fall (September-November)'),
          DJF: this.$gettext('Winter (December-February)'),
          annual: this.$gettext('Annual')
        }
      } else {
        return {
          MAM: this.$gettext('Spring (March-May)'),
          JJA: this.$gettext('Summer (June-August)'),
          SON: this.$gettext('Fall (September-November)'),
          DJF: this.$gettext('Winter (December-February)'),
          annual: this.$gettext('Annual')
        }
      }
    },
    variableTypeOptions: function () {
      let options = {
        'anomaly': this.$gettext('Anomaly values')
      }
      if (!this.pointClickOn) {
        options['trend'] = this.$gettext('Trend values')
      }
      return options
    },
    fileFormats: function () {
      return {
        json: 'json',
        GTiff: 'GeoTIFF'
      }
    },
    filename: function () {
      return this.variableOptions[this.oapicIdVariable] + ' (' + this.oapicCoverageId + ')'
    },
    dateConfigs: function () {
      let dateMax = this.oapicIdVariable === 'pcp' ? this.date_max_pcp : this.date_max
      if (this.oapicIdTimePeriod === 'monthly') {
        return {
          minimumView: 'month',
          format: 'YYYY-MM',
          placeholder: 'YYYY-MM',
          dateMin: this.date_min,
          dateMax: dateMax
        }
      } else {
        return {
          minimumView: 'year',
          format: 'YYYY',
          placeholder: 'YYYY',
          dateMin: this.date_min,
          dateMax: dateMax
        }
      }
    },
    hasErrors: function () {
      return this.hasCommonBandErrors
    },
    dateRangeNumBands: function () {
      let start = this.dateStartMoment
      let end = this.dateEndMoment
      return this.calcDateRangeNumBands(start, end)
    },
    pointInputs: function () { // raster drill process
      const varToLayerVar = {
        tmean: 'TM',
        tmin: 'TN',
        tmax: 'TX',
        pcp: 'PR'
      }
      const timeToLayerTime = {
        monthly: 'MONTHLY',
        MAM: 'SPRING',
        JJA: 'SUMMER',
        SON: 'FALL',
        DJF: 'WINTER',
        annual: 'ANNUAL'
      }

      return {
        layer: 'CANGRD.ANO.' + varToLayerVar[this.oapicIdVariable] + '_' + timeToLayerTime[this.oapicIdTimePeriod],
        y: this.clickLatLng === null ? null : this.clickLatLng.lat,
        x: this.clickLatLng === null ? null : this.clickLatLng.lng,
        format: this.wps_format
      }
    }
  },
  methods: {
    getOapicParams: function () {
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      urlParams.push(`range-subset=${this.oapicIdVariable}`)

      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x.toFixed(3)},${this.bbox_parts.min_y.toFixed(3)},${this.bbox_parts.max_x.toFixed(3)},${this.bbox_parts.max_y.toFixed(3)}`)

      // subset
      let subset = []
      // subset: seasonal
      if (this.timePeriodType === 'seasonal') {
        subset.push(`season("${this.oapicIdTimePeriod}")`)
      }
      urlParams.push(subset.join(','))

      // datetime (single YYYY-MM or range YYYY-MM/YYYY-MM)
      if (this.oapicValueType === 'anomaly') {
        urlParams.push(`datetime=${this.oapicDatetime}`)
      }

      return urlParams
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
