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
          <p v-translate>Anomalous weather resulting in Temperature and Precipitation extremes occurs almost every day somewhere in Canada. For the purpose of identifying and tabulating daily extremes of record for temperature, precipitation and snowfall, the Meteorological Service of Canada has threaded or put together data from closely related stations to compile a long time series of data for about 750 locations in Canada to monitor for record-breaking weather. Virtual Climate stations correspond with the city pages of weather.gc.ca. This data provides the daily extremes of record for Temperature for each day of the year. Daily elements include: High Maximum, Low Maximum, High Minimum, Low Minimum.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>

          <station-list-link
            :url-station-list="urlStationList"
            :download-text="$gettext('Download a list of detailed information for each LTCE station.')"></station-list-link>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          :max-zoom="18"
          :readable-columns="popup_props_display"
          :select-disabled="provinceSelected"
          :geojson="ltceStationsGeoJson"
          :stn-primary-id="stnPrimaryId"></bbox-map>

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

        <var-select
          class="mrgn-tp-md"
          v-model="wfs_layer"
          :label="$gettext('Weather element type')"
          :required="true"
          :select-options="layer_options"></var-select>

        <date-select
          v-model="date_start"
          :label="$gettext('Record extreme date')"
          :minimum-view="dateConfigs.minimumView"
          :maximum-view="dateConfigs.maximumView"
          :format="dateConfigs.format"
          :min-date="date_min"
          :max-date="date_max"
          :required="true"
          :placeholder="dateConfigs.placeholder"></date-select>

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
import DateSelect from '@/components/DateSelect'
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
    'date-select': DateSelect,
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
      date_start: this.$moment.utc(new Date(), 'MM-DD').toDate(),
      date_min: this.$moment.utc('01-01', 'MM-DD').toDate(),
      date_max: this.$moment.utc('12-31', 'MM-DD').toDate()
    }
  },
  watch: {
    wfs_province: function (newVal) {
      this.$store.dispatch('changeProvince', newVal) // to share with bbox
    },
    ows_bbox: function (newVal) {
      this.$store.dispatch('changeBBOX', newVal) // to share with station select table
    },
    activeLocale3: function (newLang3) {
      this.datasetToNameColName.ltce = `${newLang3}_STN_NAME`
    }
  },
  beforeMount () {
    // Load ahccd stations
    if (this.ltceStationsGeoJson.features.length === 0) { // prevent duplicate AJAX
      this.$store.dispatch('retrieveLtceStations', {url: this.urlStationMapList, uniqueCol: this.datasetToStnColName[this.$route.name]})
    }
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?f=json&limit=' + this.wfs_station_limit
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]}`
    },
    ltceStationsGeoJson: function () {
      return this.$store.getters.getLtceStations
    },
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Station ID')
      props[this.datasetToProvColName[this.$route.name]] = this.$gettext('Province/Territory')
      return props
    },
    layer_options: function () {
      return {
        'ltce-temperature': this.$gettext('Temperature'),
        'ltce-precipitation': this.$gettext('Precipitation'),
        'ltce-snowfall': this.$gettext('Snowfall')
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
        maximumView: 'month',
        format: 'MM-DD',
        placeholder: 'MM-DD'
      }
    },
    hasErrors: function () {
      return this.dateStartIsEmptyOnly
    },
    temporal: function () {
      if (this.dateRangeIsValid) {
        let format = this.dateConfigs.format
        let start = this.$moment.utc(this.date_start, format).format(format)
        return 'datetime=' + start
      } else {
        return null
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
