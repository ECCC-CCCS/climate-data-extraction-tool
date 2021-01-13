<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

        <p>{{ introDatasetText.station.instructions }}</p>
        <p>
          <strong>{{ introDatasetText.station.tipTitle }}</strong>
          <ul>
            <li
              v-for="(pointText, index) in introDatasetText.station.tipPoints"
              :key="index">{{ pointText }}</li>
          </ul>
        </p>

        <data-access-doc-link></data-access-doc-link>

        <details :open="toggleDetailsState">
          <summary @click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>Anomalous weather resulting in Temperature and Precipitation extremes occurs almost every day somewhere in Canada. For the purpose of identifying and tabulating daily extremes of record for temperature, precipitation and snowfall, the Meteorological Service of Canada has threaded or put together data from closely related stations to compile a long time series of data for about 750 locations in Canada to monitor for record-breaking weather.</p>

          <p>
            <span v-translate>This data provides:</span>
            <ol>
              <li v-translate>The daily extremes of record for temperature for each day of the year. Daily elements include: high maximum, low maximum, high minimum, low minimum.</li>
              <li v-translate>The daily extremes of record for precipitation for each day of the year. Daily elements include: greatest precipitation.</li>
              <li v-translate>The daily extremes of record for snowfall for each day of the year. Daily elements include: greatest snowfall.</li>
            </ol>
          </p>

          <p v-html="virtualClimateStnDescHtml"></p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>

          <strong v-translate>Virtual climate station list download:</strong>
          <ul>
            <li><station-list-link
              :url-station-list="urlStationList"
              :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station')"></station-list-link></li>
            <li><station-list-link
              :url-station-list="urlStationListElements.temperature"
              :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with temperature record type only')"></station-list-link></li>
            <li><station-list-link
              :url-station-list="urlStationListElements.precipitation"
              :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with precipitation record type only')"></station-list-link></li>
            <li><station-list-link
              :url-station-list="urlStationListElements.snowfall"
              :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with snowfall record type only')"></station-list-link></li>
          </ul>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          :max-zoom="18"
          :readable-columns="popup_props_display"
          :select-disabled="provinceSelected"
          :geojson="ltceStationsGeoJson"
          :stn-primary-id="stnPrimaryId"></bbox-map>

        <var-select
          class="mrgn-tp-md"
          v-model="wfs_layer"
          :label="$gettext('Climate element / record type')"
          :required="true"
          :select-options="layer_options"></var-select>

        <province-select
          v-model="wfs_province"></province-select>

        <station-select
          v-model="wfs_selected_station_ids"
          :select-disabled="provinceSelected"
          :station-data="ltceStationsGeoJson.features"
          :station-prop-display="station_props_display"
          :station-prov-col="stationProvCol"
          :no-province-station-selected="noProvinceStationSelected"
          :stn-primary-id="stnPrimaryId"></station-select>

        <div class="form-group">
          <label
            :for="'var-sel-local_month'" v-translate>Local month</label>
          <select class="form-control" :id="'var-sel-local_month'"
            v-model="local_month">
              <option v-for="(option, index) in sortedMonthOptions" :key="index" :value="option.val">{{ option.text }}</option>
          </select>
        </div>

        <div class="form-group">
          <label
            :for="'var-sel-local_day'" v-translate>Local day</label>
          <select class="form-control" :id="'var-sel-local_day'"
            v-model="local_day">
              <option v-for="(option, index) in sortedDayOptions" :key="index" :value="option.val">{{ option.text }}</option>
          </select>
        </div>

        <format-select-vector
          class="mrgn-tp-md"
          v-model="wfs_format"></format-select-vector>

        <url-box
          :layer-options="selectedLayerOption"
          :ows-url-formatter="wfs3_download_url"
          :wfs3-common-url="getWFS3CommonURL(wfs_layer)"
          :wfs3-download-limit="wfs_limit"
          :layer-format="wfs_format"
          :has-errors="hasErrors"
          :url-box-title="$gettext('Data download link')">
        </url-box>
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from '@/components/DatasetMenu'
import VarSelect from '@/components/VarSelect'
import BBOXMap from '@/components/BBOXMap'
import ProvinceSelect from '@/components/ProvinceSelect'
import StationSelect from '@/components/StationSelect'
import FormatSelectVector from '@/components/FormatSelectVector'
import URLBox from '@/components/URLBox'
import InfoContactSupport from '@/components/InfoContactSupport'
import StationListLink from '@/components/StationListLink'
import DataAccessDocLink from '@/components/DataAccessDocLink'
import { wfs } from '@/components/mixins/wfs'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'

export default {
  name: 'LTCEForm',
  mixins: [wfs, ows, datasets],
  components: {
    'dataset-menu': DatasetMenu,
    'bbox-map': BBOXMap,
    'province-select': ProvinceSelect,
    'station-select': StationSelect,
    'format-select-vector': FormatSelectVector,
    'var-select': VarSelect,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport,
    'station-list-link': StationListLink,
    DataAccessDocLink
  },
  data () {
    return {
      wfs_layer: 'ltce-temperature',
      wfs_layer_station: 'ltce-stations',
      wfs_station_limit: 30000,
      date_start: this.$moment.utc(new Date()).toDate(), // date_start for ease of integrating with error checks
      date_min: this.$moment.utc(new Date()).subtract(1, 'years').toDate(),
      date_max: this.$moment.utc(new Date()).toDate(),
      ltceLayerToElementKey: {
        'ltce-temperature': 'TEMPERATURE',
        'ltce-precipitation': 'PRECIPITATION',
        'ltce-snowfall': 'SNOWFALL'
      },
      local_day: this.$moment.utc(new Date()).format('DD'), // today's date
      local_month: this.$moment.utc(new Date()).format('MM') // today's month
    }
  },
  watch: {
    wfs_province: function (newVal) {
      this.$store.dispatch('changeProvince', newVal) // to share with bbox
    },
    wfs_layer: function () {
      // different layer has different stations
      this.$store.dispatch('clearStationIdSelected') // clear existing selection
      this.$store.dispatch('retrieveLtceStations', {url: this.urlStationMapList, uniqueCol: this.stnPrimaryId})
    },
    ows_bbox: function (newVal) {
      this.$store.dispatch('changeBBOX', newVal) // to share with station select table
    },
    activeLocale3: function (newLang3) {
      this.datasetToNameColName.ltce = `VIRTUAL_STATION_NAME_${newLang3[0]}`
    }
  },
  beforeMount () {
    // Load ahccd stations
    if (this.ltceStationsGeoJson.features.length === 0) { // prevent duplicate AJAX
      this.$store.dispatch('retrieveLtceStations', {url: this.urlStationMapList, uniqueCol: this.stnPrimaryId})
    }
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?f=json&limit=' + this.wfs_station_limit
    },
    urlStationListElements: function () {
      return {
        temperature: this.urlStationList + '&ELEMENT_NAME_E=TEMPERATURE',
        precipitation: this.urlStationList + '&ELEMENT_NAME_E=PRECIPITATION',
        snowfall: this.urlStationList + '&ELEMENT_NAME_E=SNOWFALL'
      }
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.stnPrimaryId},ELEMENT_NAME_E&ELEMENT_NAME_E=${this.ltceLayerToElementKey[this.wfs_layer]}`
    },
    ltceStationsGeoJson: function () {
      return this.$store.getters.getLtceStations
    },
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Virtual station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Virtual station ID')
      props[this.datasetToProvColName[this.$route.name]] = this.$gettext('Province/Territory')
      props['ELEMENT_NAME_E'] = this.$gettext('Element name')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      return props
    },
    layer_options: function () {
      return {
        'ltce-temperature': this.$gettext('Temperature - Daily extremes of record'),
        'ltce-precipitation': this.$gettext('Precipitation - Daily extremes of record'),
        'ltce-snowfall': this.$gettext('Snowfall - Daily extremes of record')
      }
    },
    selectedLayerOption: function () {
      let selLayer = {}
      selLayer[this.wfs_layer] = this.layer_options[this.wfs_layer]
      return selLayer
    },
    popup_props_display: function () {
      let stationCols = Object.keys(this.station_props_display)
      return {
        name: {
          col: stationCols[0],
          label: this.station_props_display[stationCols[0]] + this.$pgettext('Colon', ':')
        },
        id: {
          col: stationCols[1],
          label: this.station_props_display[stationCols[1]] + this.$pgettext('Colon', ':')
        },
        prov: {
          col: stationCols[2],
          label: this.station_props_display[stationCols[2]] + this.$pgettext('Colon', ':')
        }
      }
    },
    dateConfigs: function () {
      return {
        minimumView: 'day',
        maximumView: 'day',
        format: 'YYYY-MM-DD',
        placeholder: 'MM-DD'
      }
    },
    hasErrors: function () {
      return this.dateStartIsEmptyOnly
    },
    hasInvalidMomentDate: function () {
      let format = this.dateConfigs.format
      let start = this.$moment.utc(this.date_start, format).format(format)

      return (start === 'Invalid date')
    },
    dateRangeHasNull: function () {
      return this.dateStartEmpty
    },
    temporal: function () {
      if (this.dateRangeIsValid) {
        let dateQuery = []
        if (this.local_month !== 'all') {
          dateQuery.push('LOCAL_MONTH=' + this.local_month)
        }
        if (this.local_day !== 'all') {
          dateQuery.push('LOCAL_DAY=' + this.local_day)
        }
        return dateQuery.join('&')
      } else {
        return null
      }
    },
    virtualClimateStnDescHtml: function () {
      let weatherOfficeLink = (this.activeLocale === 'fr') ? '<a href="https://meteo.gc.ca/" target="_blank">meteo.gc.ca</a>' : '<a href="https://weather.gc.ca/" target="_blank">weather.gc.ca</a>'

      return this.$_i(this.$gettext('Virtual Climate stations correspond with the city pages of {weatherOfficeLink}. A Virtual Climate station is the result of threading together climate data from proximate current and historical stations to construct a long term threaded data set.  The length of the time series of virtual stations is often greater than 100 years. A Virtual Climate station is always named for an "Area" rather than a point, e.g. Winnipeg Area, to indicate that the data are drawn from that area(within a 20km radius from the urban center) rather than a single precise location.'), { weatherOfficeLink: weatherOfficeLink })
    },
    daysOfMonth: function () {
      return {
        'all': 31,
        '01': 31,
        '02': 29,
        '03': 31,
        '04': 30,
        '05': 31,
        '06': 30,
        '07': 31,
        '08': 31,
        '09': 30,
        '10': 31,
        '11': 30,
        '12': 31
      }
    },
    monthOptions: function () {
      return {
        '01': this.$gettext('01 - January'),
        '02': this.$gettext('02 - February'),
        '03': this.$gettext('03 - March'),
        '04': this.$gettext('04 - April'),
        '05': this.$gettext('05 - May'),
        '06': this.$gettext('06 - June'),
        '07': this.$gettext('07 - July'),
        '08': this.$gettext('08 - August'),
        '09': this.$gettext('09 - September'),
        '10': this.$gettext('10 - October'),
        '11': this.$gettext('11 - November'),
        '12': this.$gettext('12 - December'),
        'all': this.$gettext('All months')
      }
    },
    sortedMonthOptions: function () {
      let keys = Object.keys(this.monthOptions).sort()
      let sorted = []
      keys.forEach((key) => {
        sorted.push({val: key, text: this.monthOptions[key]})
      })
      return sorted
    },
    sortedDayOptions: function () {
      let days = []
      const maxDay = this.daysOfMonth[this.local_month]
      for (let i = 1; i < maxDay; i++) {
        let dd = i
        if (i < 10) {
          dd = '0' + i // pad with 0
        }
        dd += ''  // ensure string
        days.push({val: dd, text: dd})
      }
      days.push({val: 'all', text: this.$gettext('All days') + ` (${(this.local_month !== 'all') ? maxDay : '366'})`})
      return days
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
