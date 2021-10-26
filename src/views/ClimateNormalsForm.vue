<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <p>{{ textTipUsingTool.station.instructions }}</p>

    <div class="alert alert-info">
      <p v-html="htmlNoteMoreData"></p>
    </div>

    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Dataset description, technical information and metadata</summary>
      <p v-translate>Climate Normals 1981-2010 are used to summarize or describe the average climatic conditions of a particular location. At the completion of each decade, Environment and Climate Change Canada updates its climate normals for as many locations and as many climatic characteristics as possible. The climate normals offered here are based on Canadian climate stations with at least 15 years of data between 1981 to 2010.</p>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>

      <station-list-link
        :url-station-list="urlStationList"
        :download-text="$gettext('Download a list of detailed information for each Climate normals station.')"></station-list-link>
    </details>

    <bbox-map
      v-model="ows_bbox"
      :max-zoom="mapMaxZoom"
      :readable-columns="popup_props_display"
      :select-disabled="provinceSelected"
      :geojson="climateNormalsStationGeoJson"
      :stn-primary-id="stnPrimaryId"></bbox-map>

    <province-select
      v-model="wfs_province"></province-select>

    <station-select
      v-model="wfs_selected_station_ids"
      :select-disabled="provinceSelected"
      :station-data="climateNormalsStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"></station-select>

    <format-select-vector
      class="mrgn-tp-md"
      v-model="wfs_format"></format-select-vector>

    <url-box
      :layer-options="layer_options"
      :ows-url-formatter="wfs3_download_url"
      :wfs3-common-url="getWFS3CommonURL(wfs_layer)"
      :wfs3-download-limit="wfs_limit"
      :layer-format="wfs_format"
      :has-errors="hasErrors"
      :url-box-title="$gettext('Data download link')">
    </url-box>

    <more-resources></more-resources>
  </section>
</template>

<script>
import BBOXMap from '@/components/BBOXMap.vue'
import ProvinceSelect from '@/components/ProvinceSelect.vue'
import StationSelect from '@/components/StationSelect.vue'
import FormatSelectVector from '@/components/FormatSelectVector.vue'
import URLBox from '@/components/URLBox.vue'
import StationListLink from '@/components/StationListLink.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import MoreResources from '@/components/MoreResources.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import { wfs } from '@/components/mixins/wfs.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ClimateNormalsForm',
  mixins: [wfs, ows, datasets],
  components: {
    'bbox-map': BBOXMap,
    ProvinceSelect,
    StationSelect,
    FormatSelectVector,
    'url-box': URLBox,
    StationListLink,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources,
  },
  data () {
    return {
      wfs_layer: 'climate-normals',
      wfs_layer_station: 'climate-stations'
    }
  },
  watch: {
    wfs_province: function (newVal) {
      this.$store.dispatch('stations/changeProvince', newVal) // to share with bbox
    },
    ows_bbox: function (newVal) {
      this.$store.dispatch('map/changeBBOX', newVal) // to share with station select table
    }
  },
  beforeMount () {
    // Load climate stations
    if (this.numStationClimateNormals === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveClimateNormalsStations', this.urlStationMapList)
    }
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?f=json&HAS_NORMALS_DATA=Y&limit=' + this.wfs_station_limit
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]},DLY_FIRST_DATE,DLY_LAST_DATE`
    },
    ...mapState('stations', [
      'climateNormalsStationGeoJson'
    ]),
    ...mapGetters('stations', [
      'numStationClimateNormals'
    ]),
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Climate ID')
      props['PROV_STATE_TERR_CODE'] = this.$gettext('Province') + '&nbsp/<br>' + this.$gettext('Territory')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      props['DLY_FIRST_DATE'] = this.$gettext('First date')
      props['DLY_LAST_DATE'] = this.$gettext('Last date')
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
    htmlNoteMoreData: function () {
      const url = {
        en: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_EN + '/climate_normals/index_e.html',
        fr: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_FR + '/climate_normals/index_f.html'
      }
      const website = `<a href="${url[this.$i18n.activeLocale]}" target="_blank">` + this.$pgettext('a phrase that is mid sentence', 'Government of Canada Canadian Climate Normals website') + '</a>'
      return this.$_i(this.$gettext('Only a subset of Climate Normals stations with the longest period of record between 1981-2010 are available on this site. A complete list of all available Climate Normals are available on the {website}.'), {website: website})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
