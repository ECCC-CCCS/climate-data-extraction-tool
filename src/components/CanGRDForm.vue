<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

        <p>{{ introDatasetText.gridded.use }}</p>
        <p>{{ introDatasetText.gridded.instructions }}</p>

        <data-access-doc-link></data-access-doc-link>

        <details :open="toggleDetailsState">
          <summary @click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>Canadian gridded temperature and precipitation anomalies (CANGRD) are datasets of historical gridded temperature and precipitation anomalies, interpolated from adjusted and homogenized climate station data at a 50km resolution across Canada. Mean, minimum and maximum temperature and total precipitation anomalies represent the departure from a mean reference period (1961-1990). Temperature anomalies are expressed as degree Celsius (C) while precipitation anomalies are normalized by dividing by the mean reference period and expressed as percentage change (%). Trends of temperature change (C) for 1948-2016 and trends of relative total precipitation change (%) for 1948-2012 are also available for download.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          :allow-click-point="true"
          @change="splitBBOXString"></bbox-map>
        <var-select
          v-model="wcs_id_cangrdType"
          :label="$gettext('Value type')"
          :select-options="variableTypeOptions"></var-select>

        <var-select
          v-model="wcs_id_variable"
          :label="$gettext('Variable')"
          :select-options="variableOptions"></var-select>

        <var-select
          v-model="wcs_id_timePeriod"
          :label="$gettext('Time interval / Time of year')"
          :select-options="timePeriodOptions"></var-select>

        <fieldset v-show="!pointDownloadOn">
          <legend v-translate>Date range</legend>
          <div v-show="wcs_id_cangrdType === 'ANO'">
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
        </fieldset>

        <div
          v-show="wcs_id_cangrdType !== 'ANO'"
          class="alert alert-info">
          <p v-translate>Date ranges not required for CanGRD trends</p>
        </div>

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
          class="mrgn-tp-md"
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
import DateSelect from './DateSelect'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import DataAccessDocLink from './DataAccessDocLink'
import PointDownloadBox from './PointDownloadBox'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'
import { wps } from './mixins/wps'

export default {
  name: 'CanGRDForm',
  mixins: [wcs, ows, datasets, wps],
  components: {
    DatasetMenu,
    'bbox-map': BBOXMap,
    FormatSelectRaster,
    VarSelect,
    DateSelect,
    'url-box': URLBox,
    InfoContactSupport,
    DataAccessDocLink,
    PointDownloadBox,
    FormatSelectVector
  },
  data () {
    return {
      wcs_id: '',
      wcs_id_dataset: 'CANGRD',
      wcs_id_variable: 'TM',
      wcs_id_cangrdType: 'ANO',
      wcs_id_timePeriod: 'ANNUAL',
      ows_bbox: '-154,38,-49,81',
      date_start: this.$moment.utc('1948-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_end: this.$moment.utc('2017-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_min: this.$moment.utc('1948-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_max: this.$moment.utc('2017-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_max_pr: this.$moment.utc('2014-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate()
    }
  },
  watch: {
    wcs_id_cangrdType: function () {
      // reset unsupported selections for TREND
      if (this.wcs_id_cangrdType === 'TREND') {
        // autocorrect dependent selections to the first option for TREND
        if (!(this.wcs_id_variable in this.variableOptions)) {
          this.wcs_id_variable = Object.keys(this.variableOptions)[0]
        }
        if (!(this.wcs_id_timePeriod in this.timePeriodOptions)) {
          this.wcs_id_timePeriod = Object.keys(this.timePeriodOptions)[0]
        }
      }
    },
    wcs_id_variable: function (newVar, oldVar) {
      // Auto adjust start/end dates if goes over maximum range
      if (this.bandStartMoment.isAfter(this.dateConfigs.dateMax, this.dateConfigs.minimumView)) {
        this.date_start = this.dateConfigs.dateMax
      }
      if (this.bandEndMoment.isAfter(this.dateConfigs.dateMax, this.dateConfigs.minimumView)) {
        this.date_end = this.dateConfigs.dateMax
      }
    }
  },
  computed: {
    wcs_coverage_id: function () {
      return this.wcs_id_dataset + '.' + this.wcs_id_cangrdType + '.' + this.wcs_id_variable + '_' + this.wcs_id_timePeriod
    },
    wcs_band: function () {
      if (this.wcs_id_cangrdType === 'TREND') {
        return null
      } else {
        return this.bandRangeFormat(this.bandStart, this.bandEnd)
      }
    },
    bandStartMoment: function () {
      return this.$moment.utc(this.date_start, this.dateConfigs.format)
    },
    bandEndMoment: function () {
      return this.$moment.utc(this.date_end, this.dateConfigs.format)
    },
    bandStart: function () {
      return this.bandStartMoment.format(this.dateConfigs.format)
    },
    bandEnd: function () {
      return this.bandEndMoment.format(this.dateConfigs.format)
    },
    bandsInRange: function () {
      return this.datesInRange(this.bandStart, this.bandEnd)
    },
    bandStartIsEmptyOnly: function () {
      return this.dateStartIsEmptyOnly(this.bandStart, this.bandEnd)
    },
    bandEndIsEmptyOnly: function () {
      return this.dateEndIsEmptyOnly(this.bandStart, this.bandEnd)
    },
    bandsPastLimits: function () {
      var start = this.$moment.utc(this.date_start, this.dateConfigs.format)
      var end = this.$moment.utc(this.date_end, this.dateConfigs.format)
      var minimumView = this.dateConfigs.minimumView

      return start.isBefore(this.dateConfigs.dateMin, minimumView) ||
        start.isAfter(this.dateConfigs.dateMax, minimumView) ||
        end.isBefore(this.dateConfigs.dateMin, minimumView) ||
        end.isAfter(this.dateConfigs.dateMax, minimumView)
    },
    variableOptions: function () {
      if (this.wcs_id_cangrdType === 'ANO') {
        return {
          'TM': this.$gettext('Mean temperature'),
          'TN': this.$gettext('Minimum temperature'),
          'TX': this.$gettext('Maximum temperature'),
          'PR': this.$gettext('Total precipitation')
        }
      } else { // Trends
        return {
          'TM': this.$gettext('Mean temperature'),
          'PR': this.$gettext('Total precipitation')
        }
      }
    },
    timePeriodOptions: function () {
      if (this.wcs_id_cangrdType === 'ANO') {
        return {
          MONTHLY: this.$gettext('Monthly'),
          SPRING: this.$gettext('Spring (March-May)'),
          SUMMER: this.$gettext('Summer (June-August)'),
          FALL: this.$gettext('Fall (September-November)'),
          WINTER: this.$gettext('Winter (December-February)'),
          ANNUAL: this.$gettext('Annual')
        }
      } else {
        return {
          SPRING: this.$gettext('Spring (March-May)'),
          SUMMER: this.$gettext('Summer (June-August)'),
          FALL: this.$gettext('Fall (September-November)'),
          WINTER: this.$gettext('Winter (December-February)'),
          ANNUAL: this.$gettext('Annual')
        }
      }
    },
    variableTypeOptions: function () {
      var options = {
        'ANO': this.$gettext('Anomaly values')
      }
      if (!this.pointDownloadOn) {
        options['TREND'] = this.$gettext('Trend values')
      }
      return options
    },
    dateConfigs: function () {
      var dateMax = this.wcs_id_variable === 'PR' ? this.date_max_pr : this.date_max
      if (this.wcs_id_timePeriod === 'MONTHLY') {
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
      var start = this.bandStartMoment
      var end = this.bandEndMoment
      return this.calcDateRangeNumBands(start, end)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
