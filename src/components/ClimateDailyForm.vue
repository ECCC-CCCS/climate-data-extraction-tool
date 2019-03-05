<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <p>{{ introDatasetText.station.instructions }}</p>
        <p>
          <strong>{{ introDatasetText.station.tipTitle }}</strong>
          <ul>
            <li
              v-for="(pointText, index) in introDatasetText.station.tipPoints"
              :key="index">{{ pointText }}</li>
          </ul>
        </p>

        <details v-bind:open="toggleDetailsState">
          <summary v-on:click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>Daily climate data is derived from two sources of data; Daily Climate Stations producing one or two observations per day of temperature, precipitation, and hourly stations (see hourly data sets) that typically produce more weather elements e.g. wind or snow on ground.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>

          <station-list-link
            v-bind:url-station-list="urlStationList"
            v-bind:download-text="$gettext('Download a list of detailed information for each Daily climate station.')"></station-list-link>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-bind:max-zoom="mapMaxZoom"
          v-bind:readable-columns="popup_props_display"
          v-bind:select-disabled="provinceSelected"
          v-bind:geojson="climateStationsGeoJson"></bbox-map>

        <province-select
          v-model="wfs_province"></province-select>

        <station-select
          v-model="wfs_selected_station_ids"
          v-if="climateStationsGeoJson !== null"
          v-bind:select-disabled="provinceSelected"
          v-bind:station-data="climateStationsGeoJson.features"
          v-bind:station-prop-display="station_props_display"></station-select>

        <fieldset>
          <legend v-translate>Date range</legend>
          <date-select
            v-model="date_start"
            v-bind:label="$gettext('Start date')"
            v-bind:placeholder="$gettext('YYYY-MM-DD')"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:custom-error-msg="dateRangeErrorMessage"></date-select>

          <date-select
            v-model="date_end"
            v-bind:label="$gettext('End date')"
            v-bind:placeholder="$gettext('YYYY-MM-DD')"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:custom-error-msg="dateRangeErrorMessage"></date-select>

          <button
            class="btn btn-default"
            type="button"
            v-on:click="clearDates"
            v-translate>Clear dates</button>
        </fieldset>

        <format-select-vector
          class="mrgn-tp-md"
          v-model="wfs_format"></format-select-vector>

        <url-box
          v-bind:layer-options="layer_options"
          v-bind:ows-url-formatter="wfs3_download_url"
          v-bind:wfs3-common-url="getWFS3CommonURL(wfs_layer)"
          v-bind:wfs3-download-limit="wfs_limit"
          v-bind:layer-format="wfs_format"
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
import ProvinceSelect from './ProvinceSelect'
import StationSelect from './StationSelect'
import FormatSelectVector from './FormatSelectVector'
import DateSelect from './DateSelect'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import StationListLink from './StationListLink'
import { wfs } from './mixins/wfs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'
import axios from 'axios'

export default {
  name: 'ClimateDailyForm',
  mixins: [wfs, ows, datasets],
  components: {
    'dataset-menu': DatasetMenu,
    'bbox-map': BBOXMap,
    'province-select': ProvinceSelect,
    'station-select': StationSelect,
    'format-select-vector': FormatSelectVector,
    'date-select': DateSelect,
    'url-box': URLBox,
    'info-contact-support': InfoContactSupport,
    'station-list-link': StationListLink
  },
  data () {
    return {
      wfs_layer: 'climate-daily',
      wfs_layer_station: 'climate-stations',
      date_start: this.$moment.utc('1840-03-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc().toDate(),
      date_min: this.$moment.utc('1840-03-01', 'YYYY-MM-DD').toDate(),
      date_max: this.$moment.utc().toDate()
    }
  },
  watch: {
    wfs_province: function (newVal, oldVal) {
      this.$store.dispatch('changeProvince', newVal) // to share with bbox
    },
    ows_bbox: function (newVal, oldVal) {
      this.$store.dispatch('changeBBOX', newVal) // to share with station select table
    }
  },
  beforeMount () {
    // Load climate stations
    if (this.climateStationsGeoJson === null) { // prevent duplicate AJAX
      this.$store.dispatch('retrieveClimateNormalsStations', this.urlStationList)
    }

    // Get min local_date dynamically to set date_min
    var minDate = this.$store.getters.getClimateNormalsMinDate
    if (minDate === null) { // prevent duplicate AJAX
      let thisComp = this // for reference in axios response; "this" reserved in axios

      axios.get(this.urlDatasetMinDate)
        .then(function (response) {
          if (response.data.hasOwnProperty('features')) {
            minDate = response.data.features[0].properties.LOCAL_DATE
            thisComp.$store.dispatch('setClimateDailyMinDate', minDate)
            thisComp.date_start = thisComp.$moment.utc(minDate.substring(0, 10), 'YYYY-MM-DD').toDate()
            thisComp.date_min = thisComp.$moment.utc(minDate.substring(0, 10), 'YYYY-MM-DD').toDate()
          }
        })
    } else {
      this.date_start = this.$moment.utc(minDate.substring(0, 10), 'YYYY-MM-DD').toDate()
      this.date_min = this.$moment.utc(minDate.substring(0, 10), 'YYYY-MM-DD').toDate()
    }

    // reset existing selections that share with other components
    this.$store.dispatch('changeProvince', 'null') // to share with bbox
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?limit=' + this.wfs_station_limit
    },
    urlDatasetMinDate: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer + '/items?sortby=LOCAL_DATE&limit=1'
    },
    climateStationsGeoJson: function () {
      return this.$store.getters.getClimateNormalsStations
    },
    station_props_display: function () {
      return {
        'STATION_NAME': this.$gettext('Station name'),
        'STN_ID': this.$gettext('Station ID'),
        'PROV_STATE_TERR_CODE': this.$gettext('Province/Territory/State')
      }
    },
    popup_props_display: function () {
      var stationCols = Object.keys(this.station_props_display)
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
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
