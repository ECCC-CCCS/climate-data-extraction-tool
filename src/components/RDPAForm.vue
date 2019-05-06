<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

        <p>{{ introDatasetText.gridded.use }}</p>
        <p>{{ introDatasetText.gridded.instructions }}</p>

        <data-access-doc-link></data-access-doc-link>

        <details v-bind:open="toggleDetailsState">
          <summary v-on:click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>The Regional Deterministic Precipitation Analysis (RDPA) produces a best estimate of the amount of precipitation that occurred over recent past periods of 6 or 24 hours. The estimate integrates data from in situ precipitation gauge measurements, weather radar and numerical weather prediction models. Geographic coverage is North America (Canada, United States and Mexico). Data is available at horizontal resolution of 10 km. Data is only available for the surface level. Analysis data is made available four times a day for 6h intervals and once a day for the 24h interval. A preliminary estimate is available approximately 1h after the end of the accumulation period, and revised 6h after in order to assimilate gauge data arriving later.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-on:change="splitBBOXString"></bbox-map>

        <var-select
          v-model="wcs_id_type"
          v-bind:label="$gettext('Model type')"
          v-bind:details-text="typeDetailsText"
          v-bind:details-title="typeDetailsTitle"
          v-bind:select-options="typeOptions"></var-select>

        <var-select
          v-model="wcs_id_time"
          v-bind:label="$gettext('Precipitation accumulation interval')"
          v-bind:select-options="timeOptions"></var-select>

        <date-select
          v-model="forecastDate"
          v-bind:label="$gettext('Analysis date')"
          v-bind:minimum-view="dateConfigs.minimumView"
          v-bind:format="dateConfigs.format"
          v-bind:placeholder="dateConfigs.placeholder"
          v-bind:required="true"
          v-bind:min-date="forecastDateRange.min"
          v-bind:max-date="forecastDateRange.max"></date-select>

        <var-select
          v-model="forecastTimeZ"
          v-bind:label="$gettext('Analysis run hour')"
          v-bind:select-options="timeZOptions"></var-select>

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
import DataAccessDocLink from './DataAccessDocLink'
import { wcs } from './mixins/wcs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'RDPAForm',
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
    DataAccessDocLink,
    DownloadWarning
  },
  data () {
    return {
      wcs_id_dataset: 'RDPA',
      wcs_id_type: 'FORE', // FORE or ARC
      wcs_id_time: '6F', // 6F, 6P, 24F, 24P
      wcs_id_resolution: '15km', // 10km, 15km
      wcs_id_variable: 'PR', // Quantity of Precip
      arc15RunMoment06FMin: this.$moment.utc('2011-04-06 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      arc15RunMoment06FMax: this.$moment.utc('2012-10-03 00:00:00', 'YYYY-MM-DD HH:mm:ss'),
      arc15RunMoment24FMin: this.$moment.utc('2011-04-06 12:00:00', 'YYYY-MM-DD HH:mm:ss'),
      arc15RunMoment24FMax: this.$moment.utc('2012-10-02 12:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMoment06FMin: this.$moment.utc('2012-10-03 06:00:00', 'YYYY-MM-DD HH:mm:ss'),
      foreRunMoment24FMin: this.$moment.utc('2012-10-03 12:00:00', 'YYYY-MM-DD HH:mm:ss'),
      forecastDate: this.$moment.utc('00:00:00', 'HH:mm:ss').subtract(1, 'days').toDate(),
      forecastTimeZ: '00Z',
      dateConfigs: {
        minimumView: 'day',
        format: 'YYYY-MM-DD',
        placeholder: 'YYYY-MM-DD'
      }
    }
  },
  watch: {
    wcs_id_type: function (newVal, oldVal) {
      this.adjustForePeriod()
    },
    wcs_id_resolution: function (newVal, oldVal) {
      this.adjustForePeriod()
    },
    wcs_id_time: function (newVal, oldVal) {
      if (this.timeZis24) {
        this.forecastTimeZ = '12Z'
      }
    },
    timeZOptions: function (newVal, oldVal) {
      this.adjustForecastTimeZ()
    }
  },
  computed: {
    wcs_coverage_id: function () {
      // generate coverageID
      var coverageIdParts = []
      coverageIdParts.push(this.wcs_id_dataset)
      if (this.wcs_id_type === 'ARC') {
        coverageIdParts.push(this.wcs_id_type + '_' + this.wcs_id_resolution)
      }
      coverageIdParts.push(this.wcs_id_time + '_' + this.wcs_id_variable)
      return coverageIdParts.join('.')
    },
    typeOptions: function () {
      return {
        'FORE': this.$gettext('Analysis'), // Forecast
        'ARC': this.$gettext('Archive')
      }
    },
    typeDetailsText: function () {
      return [
        this.$gettext('<strong>Analysis data (10km)</strong> is available from 2012-10-03 12:00 Coordinated Universal Time (UTC) up until today.'),
        this.$gettext('<strong>Archive</strong> data is the 15km archives and are available from 2011-04-06 12:00 UTC to 2012-10-02 12:00 UTC.')
      ]
    },
    typeDetailsTitle: function () {
      return this.$gettext('Explanation of model types')
    },
    resoOptions: function () {
      return {
        // '10km': this.$gettext('10km'),
        '15km': this.$gettext('15km')
      }
    },
    timeOptions: function () {
      if (this.wcs_id_type === 'ARC') {
        return {
          '6F': this.$gettext('6 hours'),
          '24F': this.$gettext('24 hours')
        }
      } else {
        return {
          '6F': this.$gettext('6 hours'),
          // '6P': this.$gettext('6 hours preliminary'),
          '24F': this.$gettext('24 hours')
          // '24P': this.$gettext('24 hours preliminary')
        }
      }
    },
    timeZis24: function () {
      return this.wcs_id_time.includes('24', 0)
    },
    timeZOptions: function () {
      var allZOptions = {
        '00Z': this.$gettext('00Z'),
        '06Z': this.$gettext('06Z'),
        '12Z': this.$gettext('12Z'),
        '18Z': this.$gettext('18Z')
      }

      var forecastDateYYYYMMDD = this.forecastDateMoment.format('YYYY-MM-DD')
      var maxDateMoment = this.forecastDateMomentRange.max
      var maxDateMomentYYYYMMDD = maxDateMoment.format('YYYY-MM-DD')

      if (this.timeZis24) { // PT24H; 24 hour interval only allows 12Z selection
        return {
          '12Z': this.$gettext('12Z')
        }
      } else { // PT6H; 6 hour interval selection
        // Forecast date + hour options must not exceed max date limit
        if (forecastDateYYYYMMDD === maxDateMomentYYYYMMDD) {
          var pt6HOptions = ['00', '06', '12', '18']
          var maxDateISO = maxDateMoment.format('YYYY-MM-DD[T]HH:mm:ss[Z]')
          var zOptions = {}
          for (var pt6 of pt6HOptions) {
            var testForecastPt6H = forecastDateYYYYMMDD + 'T' + pt6 + ':00:00Z'
            var pt6Z = pt6 + 'Z'
            if (testForecastPt6H <= maxDateISO) {
              zOptions[pt6Z] = allZOptions[pt6Z]
            }
          }
          return zOptions
        } else {
          return allZOptions
        }
      }
    },
    selectedCoverageIdOption: function () {
      var wcsCoverage = {}
      wcsCoverage[this.wcs_coverage_id] = this.currentRouteTitle + ' (' + this.wcs_coverage_id + ')'
      return wcsCoverage
    },
    forecastDateMoment: function () {
      return this.$moment.utc(this.forecastDate)
    },
    forecastDateISO: function () {
      var hh = this.forecastTimeZ.substring(0, 2) // first 2 are HH
      return this.forecastDateMoment.format('YYYY-MM-DD') + 'T' + hh + ':00:00Z'
    },
    foreRunMoment06FMax: function () {
      // 1 day from today
      return this.$moment.utc().subtract(1, 'days')
    },
    foreRunMoment24FMax: function () {
      // 1 day from today
      return this.$moment.utc().subtract(1, 'days')
    },
    forecastDateMomentRange: function () {
      // Forecast period range limits based on what type selected
      if (this.wcs_id_type === 'ARC' && this.wcs_id_resolution === '15km' && this.wcs_id_time === '6F') {
        return {
          min: this.arc15RunMoment06FMin,
          max: this.arc15RunMoment06FMax
        }
      } else if (this.wcs_id_type === 'ARC' && this.wcs_id_resolution === '15km' && this.wcs_id_time === '24F') {
        return {
          min: this.arc15RunMoment24FMin,
          max: this.arc15RunMoment24FMax
        }
      } else if (this.wcs_id_type === 'FORE' && this.wcs_id_time === '6F') { // Analysis (Forecast) type
        return {
          min: this.foreRunMoment06FMin,
          max: this.foreRunMoment06FMax
        }
      } else if (this.wcs_id_type === 'FORE' && this.wcs_id_time === '24F') { // Analysis (Forecast) type
        return {
          min: this.foreRunMoment24FMin,
          max: this.foreRunMoment24FMax
        }
      }
    },
    forecastDateRange: function () {
      return {
        min: this.forecastDateMomentRange.min.toDate(),
        max: this.forecastDateMomentRange.max.toDate()
      }
    },
    forecastDatetimeMoment: function () {
      return this.$moment.utc(this.forecastDateISO, 'YYYY-MM-DDTHH:mm:ssZ')
    },
    forecastDateIsEmpty: function () {
      return this.forecastDate === null || this.forecastDate === 'Invalid date'
    },
    forecastDateOutOfRange: function () {
      var foreDate = this.forecastDateMoment
      var minimumView = this.dateConfigs.minimumView

      // ignore check if null
      if (this.forecastDateIsEmpty) {
        return false
      }

      return foreDate.isBefore(this.forecastDateMomentRange.min, minimumView) ||
        foreDate.isAfter(this.forecastDateMomentRange.max, minimumView)
    },
    hasErrors: function () {
      return this.forecastDateOutOfRange ||
        this.forecastDateIsEmpty
    }
  },
  methods: {
    wcs_download_url: function (coverageId) { // replaces existing function from wcs mixin
      this.splitBBOXString()
      var url = this.wcs2_weather_url_base + '&'
      var urlParams = this.getWCSCommonParams(coverageId)

      // Forecast Time
      var ft = this.forecastDateISO
      if (ft !== '' && ft !== null) {
        urlParams.push('TIME=' + ft)
      }

      url += urlParams.join('&')
      return url
    },
    adjustForePeriod: function () {
      // Auto adjust forecast period date if out of range
      if (!this.forecastDateMoment.isBetween(this.forecastDateMomentRange.min, this.forecastDateMomentRange.max, 'day')) {
        this.forecastDate = this.forecastDateMomentRange.min.format('YYYY-MM-DD')
      }
    },
    adjustForecastTimeZ: function () {
      // Auto adjust forecastTimeZ if current selection is not available from timeZOptions
      if (!(this.forecastTimeZ in this.timeZOptions)) {
        this.forecastTimeZ = Object.keys(this.timeZOptions)[0]
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
