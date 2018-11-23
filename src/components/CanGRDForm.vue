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
          <p v-translate>Gridded historical climate data, also referred to as Canadian gridded data (CANGRD), are datasets of historical gridded temperature and precipitation anomalies, interpolated from adjusted and homogenized climate station data at a 50km resolution across Canada. Mean, minimum and maximum temperature and total precipitation anomalies represent the departure from a mean reference period (1961-1990). Temperature anomalies are expressed as degree Celsius (C) while precipitation anomalies are normalized by dividing by the mean reference period and expressed as percentage change (%). Trends of temperature change (C) for 1948-2016 and trends of relative total precipitation change (%) for 1948-2012 are also available for download.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-on:change="splitBBOXString"></bbox-map>
        <var-select
          v-model="wcs_id_cangrdType"
          v-bind:label="$gettext('Value type')"
          v-bind:select-options="variableTypeOptions"></var-select>

        <var-select
          v-model="wcs_id_variable"
          v-bind:label="$gettext('Variable')"
          v-bind:select-options="variableOptions"></var-select>

        <var-select
          v-model="wcs_id_timePeriod"
          v-bind:label="$gettext('Time interval / Time of year')"
          v-bind:select-options="timePeriodOptions"></var-select>

        <fieldset>
          <legend v-translate>Date range</legend>
          <div v-show="wcs_id_cangrdType === 'ANO'">
            <date-select
              v-model="date_start"
              v-bind:label="$gettext('Start date')"
              v-bind:minimum-view="dateConfigs.minimumView"
              v-bind:format="dateConfigs.format"
              v-bind:min-date="dateConfigs.dateMin"
              v-bind:max-date="dateConfigs.dateMax"
              v-bind:custom-error-msg="dateRangeErrorMessage"
              v-bind:placeholder="dateConfigs.placeholder"></date-select>

            <date-select
              v-model="date_end"
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
        </fieldset>

        <div
          v-show="wcs_id_cangrdType !== 'ANO'"
          class="alert alert-info">
          <p v-translate>Date ranges not required for CanGRD trends</p>
        </div>

        <format-select-raster
          class="mrgn-tp-md"
          v-model="wcs_format"
          v-bind:info-text="[infoSupportDeskGridPoint]"></format-select-raster>

        <details v-bind:open="toggleDetailsAdvState" class="mrgn-tp-md">
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
import DateSelect from './DateSelect'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'CanGRDForm',
  mixins: [wcs, ows, datasets],
  components: {
    'dataset-menu': DatasetMenu,
    'bbox-map': BBOXMap,
    'format-select-raster': FormatSelectRaster,
    'var-select': VarSelect,
    'date-select': DateSelect,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport
  },
  data () {
    return {
      min_year: 1900,
      max_year: 2017,
      max_year_pr: 2014,
      wcs_id: '',
      wcs_id_dataset: 'CANGRD',
      wcs_id_variable: 'TM',
      wcs_id_cangrdType: 'ANO',
      wcs_id_timePeriod: 'ANNUAL',
      ows_bbox: '-154,38,-49,81',
      bandYearStart: 1900,
      bandYearEnd: 2014,
      bandMonthStart: 1,
      bandMonthEnd: 12,
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
        if (!(this.wcs_id_variable in this.variableOptions)) {
          this.wcs_id_variable = ''
        }
        if (!(this.wcs_id_timePeriod in this.timePeriodOptions)) {
          this.wcs_id_timePeriod = ''
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
      var start = this.$moment.utc(this.date_start)
      var end = this.$moment.utc(this.date_end)
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
      return {
        'ANO': this.$gettext('Anomaly values'),
        'TREND': this.$gettext('Trend values')
      }
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
      return this.bandStartIsEmptyOnly ||
        this.bandEndIsEmptyOnly ||
        !this.bandsInRange ||
        this.bandsPastLimits ||
        this.tooManyBands
    },
    dateRangeNumBands: function () {
      var start = this.bandStartMoment
      var end = this.bandEndMoment
      // Determine number of months (bands) in date range for monthly
      if (start === null || end === null) {
        return 0
      } else if (this.wcs_id_timePeriod === 'MONTHLY' && this.bandsInRange) {
        return Math.ceil(this.$moment.duration(end.diff(start)).asMonths()) + 1 // +1 for range is inclusive
      } else if (this.bandsInRange) { // yearly date range
        return Math.ceil(this.$moment.duration(end.diff(start)).asYears())
      } else {
        return 0
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
