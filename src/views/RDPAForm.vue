<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-translate>The Regional Deterministic Precipitation Analysis (RDPA) produces a best estimate of the amount of precipitation that occurred over recent past periods of 6 or 24 hours. The estimate integrates data from in situ precipitation gauge measurements, weather radar and numerical weather prediction models. Geographic coverage is North America (Canada, United States and Mexico). Data is available at horizontal resolution of 10 km. Data is only available for the surface level. Analysis data is made available four times a day for 6h intervals and once a day for the 24h interval. A preliminary estimate is available approximately 1h after the end of the accumulation period, and revised 6h after in order to assimilate gauge data arriving later.</p>

    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>
    </details>

    <bbox-map
      v-model="ows_bbox"
      @change="splitBBOXString"></bbox-map>

    <var-select
      v-model="oapicIdResolution"
      :label="$gettext('Model type')"
      :details-text="typeDetailsText"
      :details-title="typeDetailsTitle"
      :select-options="modelTypeOptions"></var-select>

    <var-select
      v-model="oapicIdVariable"
      :disabled="true"
      :label="$gettext('Quantity type')"
      :select-options="variableOptions"></var-select>

    <var-select
      v-model="oapicIdTime"
      :label="$gettext('Precipitation accumulation interval')"
      :select-options="timeOptions"></var-select>

    <date-select
      v-model="forecastDate"
      :label="$gettext('Analysis date')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :placeholder="dateConfigs.placeholder"
      :required="true"
      :min-date="forecastDateRange.min"
      :max-date="forecastDateRange.max"></date-select>

    <var-select
      v-model="forecastTimeZ"
      :label="$gettext('Analysis run hour')"
      :select-options="timeZOptions"></var-select>

    <format-select-file
      class="mrgn-tp-md"
      v-model="oapicFormat"
      :formats="fileFormats"></format-select-file>

    <data-download-box
      :file-name="filename"
      :file-format="oapicFormat"
      :download-url="oapicUrl"
      :date-range-chunks="downloadLinkTitleBreakdown"
      :has-errors="hasErrors">
    </data-download-box>

    <more-resources></more-resources>
  </section>
</template>

<script>
import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectFile from '@/components/FormatSelectFile.vue'
import VarSelect from '@/components/VarSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import DataDownloadBox from '@/components/DataDownloadBox.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import MoreResources from '@/components/MoreResources.vue'
import { oapiCoverage } from '@/components/mixins/oapi-coverage.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'

export default {
  name: 'RDPAForm',
  mixins: [oapiCoverage, ows, datasets],
  components: {
    'bbox-map': BBOXMap,
    FormatSelectFile,
    VarSelect,
    DateSelect,
    DataDownloadBox,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources
  },
  data () {
    return {
      oapicIdDataset: 'RDPA',
      oapicIdTime: '6F', // 6F, 6P, 24F, 24P
      oapicIdResolution: '10km', // 10km, 15km
      oapicIdVariable: '1', // Quantity of Precip
      oapicFormat: 'json',
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
    oapicIdResolution: function () {
      this.adjustForePeriod()
    },
    oapicIdTime: function () {
      if (this.timeZis24) {
        this.forecastTimeZ = '12Z'
      }
    },
    timeZOptions: function () {
      this.adjustForecastTimeZ()
    }
  },
  computed: {
    oapicCoverageId: function () {
      return `weather:${this.oapicIdDataset}:${this.oapicIdResolution}:${this.oapicIdTime}`
    },
    oapicDatetime: function () {
      return this.forecastDateMoment.format('YYYY-MM-DD') + 'T' + this.forecastTimeZ
    },
    variableOptions: function () {
      return {
        '1': this.$_i(this.$gettext('24 hr Total precipitation [{units}]'),{units: 'kg/(m&sup2;)'}),
        '2': this.$gettext('(prodType 0, cat 1, subcat 193) [-]')
      }
    },
    modelTypeOptions: function () {
      return {
        '10km': this.$gettext('Analysis') + ' (10km)', // Forecast
        '15km': this.$gettext('Archive') + ' (15km)'
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
    timeOptions: function () {
      if (this.oapicIdResolution === '15km') {
        return {
          '6F': this.$gettext('6 hours'),
          '24F': this.$gettext('24 hours')
        }
      } else {
        return {
          '6F': this.$gettext('6 hours'),
          '6P': this.$gettext('6 hours preliminary'),
          '24F': this.$gettext('24 hours'),
          '24P': this.$gettext('24 hours preliminary')
        }
      }
    },
    timeZis24: function () {
      return this.oapicIdTime.includes('24', 0)
    },
    timeZOptions: function () {
      let allZOptions = {
        '00Z': this.$gettext('00Z'),
        '06Z': this.$gettext('06Z'),
        '12Z': this.$gettext('12Z'),
        '18Z': this.$gettext('18Z')
      }

      let forecastDateYYYYMMDD = this.forecastDateMoment.format('YYYY-MM-DD')
      let maxDateMoment = this.forecastDateMomentRange.max
      let maxDateMomentYYYYMMDD = maxDateMoment.format('YYYY-MM-DD')

      if (this.timeZis24) { // PT24H; 24 hour interval only allows 12Z selection
        return {
          '12Z': this.$gettext('12Z')
        }
      } else { // PT6H; 6 hour interval selection
        // Forecast date + hour options must not exceed max date limit
        if (forecastDateYYYYMMDD === maxDateMomentYYYYMMDD) {
          let pt6HOptions = ['00', '06', '12', '18']
          let maxDateISO = maxDateMoment.format('YYYY-MM-DD[T]HH:mm:ss[Z]')
          let zOptions = {}
          for (let pt6 of pt6HOptions) {
            let testForecastPt6H = forecastDateYYYYMMDD + 'T' + pt6 + ':00:00Z'
            let pt6Z = pt6 + 'Z'
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
    downloadLinkTitleBreakdown: function () {
      return [{
        specialTitle: `${this.oapicIdDataset} | ${this.oapicIdResolution} | ${this.oapicIdTime} | ${this.oapicDatetime} | ${this.fileFormats[this.oapicFormat]}`
      }]
    },
    forecastDateMoment: function () {
      return this.$moment.utc(this.forecastDate)
    },
    forecastDateISO: function () {
      let hh = this.forecastTimeZ.substring(0, 2) // first 2 are HH
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
      if (this.oapicIdResolution === '15km' && this.oapicIdTime === '6F') {
        return {
          min: this.arc15RunMoment06FMin,
          max: this.arc15RunMoment06FMax
        }
      } else if (this.oapicIdResolution === '15km' && this.oapicIdTime === '24F') {
        return {
          min: this.arc15RunMoment24FMin,
          max: this.arc15RunMoment24FMax
        }
      } else if (this.oapicIdResolution === '10km' && this.oapicIdTime === '6F') { // Analysis (Forecast) type
        return {
          min: this.foreRunMoment06FMin,
          max: this.foreRunMoment06FMax
        }
      } else if (this.oapicIdResolution === '10km' && this.oapicIdTime === '24F') { // Analysis (Forecast) type
        return {
          min: this.foreRunMoment24FMin,
          max: this.foreRunMoment24FMax
        }
      } else {
        return {
          min: null,
          max: null
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
      let foreDate = this.forecastDateMoment
      let minimumView = this.dateConfigs.minimumView

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
    getOapicParams: function () {
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      urlParams.push(`range-subset=${this.oapicIdVariable}`)

      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x.toFixed(3)},${this.bbox_parts.min_y.toFixed(3)},${this.bbox_parts.max_x.toFixed(3)},${this.bbox_parts.max_y.toFixed(3)}`)

      // datetime
      urlParams.push(`datetime=${this.oapicDatetime}`)

      return urlParams
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
