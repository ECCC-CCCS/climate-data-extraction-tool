<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <p v-translate>Historical hydrometric data are standardized water resource data and information. They are collected, interpreted and disseminated by the Water Survey of Canada (WSC) in partnership with the provinces, territories and other agencies through the National Hydrometric Program. These data sets include daily mean, monthly mean, annual maximum and minimum daily mean and instantaneous peak water level and discharge information for over 2700 active and 5080 discontinued hydrometric monitoring stations across Canada.</p>

    <tips-using-tool></tips-using-tool>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>

      <station-list-link
        :url-station-list="urlStationList"
        :download-text="$gettext('Download a list of detailed information for each Historical hydrometric station.')"></station-list-link>
    </details>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary id="map-filters-header" v-translate>Map filters</summary>

      <province-select
        v-model="oapif_province"></province-select>

      <fieldset>
        <legend v-translate>Date range</legend>

        <date-select
          v-model="date_start"
          :label="$gettext('Start date')"
          :min-date="date_min"
          :max-date="date_max"
          :minimum-view="dateConfigs.minimumView"
          :format="dateConfigs.format"
          :custom-error-msg="dateRangeErrorMessage"
          :placeholder="dateConfigs.placeholder"></date-select>

        <date-select
          v-model="date_end"
          :label="$gettext('End date')"
          :min-date="date_min"
          :max-date="date_max"
          :minimum-view="dateConfigs.minimumView"
          :format="dateConfigs.format"
          :custom-error-msg="dateRangeErrorMessage"
          :placeholder="dateConfigs.placeholder"></date-select>

        <button
          id="clear-dates-btn"
          class="btn btn-default"
          type="button"
          @click="clearDates"
          v-translate>Clear dates</button>
      </fieldset>
    </details>

    <bbox-map
      v-model="ows_bbox"
      :max-zoom="mapMaxZoom"
      :readable-columns="popup_props_display"
      :select-disabled="provinceSelected"
      :geojson="hydroStationGeoJson"
      :stn-primary-id="stnPrimaryId"
      :hydro-station-display="true"></bbox-map>

    <station-select
      v-model="oapif_selected_station_ids"
      :select-disabled="provinceSelected"
      :station-data="hydroStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"
      :hydro-station-display="true"></station-select>

    <var-select
      class="mrgn-tp-md"
      v-model="oapif_layer"
      :label="$gettext('Value type / Time interval')"
      :required="true"
      :select-options="layer_options"></var-select>

    <format-select-vector
      class="mrgn-tp-md"
      v-model="oapif_format"></format-select-vector>

    <url-box
      :layer-options="selectedLayerOption"
      :ows-url-formatter="oapif_download_url"
      :oapif-common-url="getWFS3CommonURL(oapif_layer)"
      :oapif-download-Limit="oapif_limit"
      :layer-format="oapif_format"
      :has-errors="hasErrors"
      :url-box-title="$gettext('Data download links')">
    </url-box>

    <more-resources></more-resources>
  </section>
</template>

<script>
import VarSelect from '@/components/VarSelect.vue'
import BBOXMap from '@/components/BBOXMap.vue'
import ProvinceSelect from '@/components/ProvinceSelect.vue'
import StationSelect from '@/components/StationSelect.vue'
import FormatSelectVector from '@/components/FormatSelectVector.vue'
import DateSelect from '@/components/DateSelect.vue'
import URLBox from '@/components/URLBox.vue'
import StationListLink from '@/components/StationListLink.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import MoreResources from '@/components/MoreResources.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import { oapif } from '@/components/mixins/oapi-features.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'HydrometricArchiveForm',
  mixins: [oapif, ows, datasets],
  components: {
    VarSelect,
    'bbox-map': BBOXMap,
    ProvinceSelect,
    StationSelect,
    FormatSelectVector,
    DateSelect,
    'url-box': URLBox,
    StationListLink,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources,
  },
  data () {
    return {
      oapif_layer: 'hydrometric-daily-mean',
      oapif_layer_station: 'hydrometric-stations',
      date_start: this.$moment.utc('1850-01-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc().toDate(),
      date_min: this.$moment.utc('1850-01-01', 'YYYY-MM-DD').toDate(),
      date_max: this.$moment.utc().toDate()
    }
  },
  watch: {
    oapif_province: function (newVal) {
      this.$store.dispatch('stations/changeProvince', newVal) // to share with bbox
    },
    ows_bbox: function (newVal) {
      this.$store.dispatch('map/changeBBOX', newVal) // to share with station select table
    },
    hydroStationActive: function (newVal) { // display inactive stations
      if (newVal === false) {
        this.$store.dispatch('stations/retrieveHydroStations', this.urlStationMapList)
      }
    }
  },
  beforeMount () {
    // Load hydrometric stations
    if (this.numStationHydro === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveHydroStations', this.urlStationMapList)
    }
  },
  computed: {
    ...mapState('stations', {
      hydroStationActive: 'hydroStationActive',
      hydroStationGeoJson (state) {
        let hs = state.hydroStationGeoJson
        if (hs === null) {
          return null
        }
        let hydroStations = Object.assign({}, hs) // Clone object to prevent original alteration
        if (this.hydroStationActive) { // filter here so it works with map and table
          if (Object.prototype.hasOwnProperty.call(hydroStations, 'features')) {
            hydroStations.features = hydroStations.features.filter((feature) => {
              return feature.properties.STATUS_EN === 'Active'
            })
          }
        }
        return hydroStations
      }
    }),
    ...mapGetters('stations', [
      'numStationHydro'
    ]),
    urlStationList: function () {
      let url = this.oapif_url_base + '/' + this.oapif_layer_station + '/items?f=json&limit=' + this.oapif_station_limit
      if (this.hydroStationActive) {
        url += '&STATUS_EN=Active'
      }
      return url
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]},STATUS_EN`
    },
    layer_options: function () {
      return {
        'hydrometric-daily-mean': this.$gettext('Daily mean'),
        'hydrometric-monthly-mean': this.$gettext('Monthly mean'),
        'hydrometric-annual-peaks': this.$gettext('Annual max/min'),
        'hydrometric-annual-statistics': this.$gettext('Daily max/min')
      }
    },
    selectedLayerOption: function () {
      let selLayer = {}
      selLayer[this.oapif_layer] = this.layer_options[this.oapif_layer]
      return selLayer
    },
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Station ID')
      props[this.datasetToProvColName[this.$route.name]] = this.$gettext('Province') + '&nbsp/<br>' + this.$gettext('Territory') + '&nbsp/<br>' + this.$gettext('State')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      return props
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
      if (this.oapif_layer === 'hydrometric-monthly-mean') {
        return {
          minimumView: 'month',
          format: 'YYYY-MM',
          placeholder: 'YYYY-MM'
        }
      } else {
        return {
          minimumView: 'day',
          format: 'YYYY-MM-DD',
          placeholder: 'YYYY-MM-DD'
        }
      }
    },
    temporal: function () {
      if (this.dateRangeIsValid) {
        let start = this.$moment.utc(this.date_start).format(this.dateConfigs.format)
        let end = this.$moment.utc(this.date_end).format(this.dateConfigs.format)
        return 'datetime=' + start + '/' + end
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
