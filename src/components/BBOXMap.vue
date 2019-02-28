<template>
  <div id="bbox-map-container">
    <label
      for="ows_bbox"
      class="wb-inv"
      v-translate>Bounding box coordinates</label>

    <details v-bind:open="toggleDetailsState">
      <summary v-on:click="toggleDetails"
        v-translate>How to use: interactive map</summary>
      <p v-translate>Use this map to select a geographic subset of the data. The geographic subset of the downloaded data will match the area shown in the map.</p>
      <p><strong v-translate>Panning:</strong>
        <translate
          t-comment="<kbd>Tab</kbd> represents the keyboard button name">To pan the map, click and drag over the interactive map. Alternatively, <kbd>tab</kbd> focus to the interactive map box and then press the arrow keys.</translate>
      </p>
      <p><strong v-translate>Zooming:</strong>
        <translate t-comment="<kbd> tags represent a keyboard button name. Do not adjust spacing.">To zoom in and out of the map, mouse scroll up and down while you mouse over the interactive map or click on the <kbd><abbr title="Plus Sign">+</abbr></kbd> and <kbd><abbr title="Minus Sign">-</abbr></kbd> buttons respectively. Alternatively, <kbd>tab</kbd> focus to the interactive map box and then press the <kbd><abbr title="Plus Sign">+</abbr></kbd> or <kbd><abbr title="Minus Sign">-</abbr></kbd> keys.</translate>
      </p>
    </details>

    <l-map
      id="bbox-map"
      ref="BBOXMap"
      tabindex="0"
      :zoom="zoom"
      :minZoom="minZoom"
      :maxZoom="maxZoom"
      :center="center"
      :maxBounds="maxBounds"
      :continuousWorld="false"
      @moveend="updateBBOXfromMap"
      >
        <!-- <l-tile-layer :url="urlWMTS_CMBT[$i18n.activeLocale]"></l-tile-layer> -->
        <l-geo-json ref="geojsonLayer" :geojson="geojson" :options="geoJsonOptions"></l-geo-json>
    </l-map>

    <div class="form-group">
      <button
        v-on:click="resetBBOX"
        type="button"
        v-bind:disabled="selectDisabled"
        class="btn btn-primary" v-translate>Reset map</button>
    </div>

    <!-- <div class="form-group">
      <div class="input-group">
        <input type="text"
        class="form-control wb-inv" id="ows_bbox"
        readonly
        v-bind:placeholder="$gettext('Enter bounding box in decimal lat/lon')"
        v-model="bbox_value"
        v-on:change="updateBBOX">
        <span class="input-group-btn">
          <button
          v-on:click="resetBBOX"
          type="button"
          v-bind:disabled="selectDisabled"
          class="btn btn-primary" v-translate>Reset</button>
        </span>
      </div>
    </div> -->
  </div>
</template>

<script>
import L from 'leaflet'
import Vue2Leaflet from 'vue2-leaflet'
import LW from 'leaflet.wms'
import 'proj4leaflet'
import store from '../store/store'

// Default icon settings
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
  name: 'BBOXMap',
  components: {
    'l-map': Vue2Leaflet.LMap,
    'l-tile-layer': Vue2Leaflet.LTileLayer,
    'l-wms-tile-layer': Vue2Leaflet.LWMSTileLayer,
    'l-geo-json': Vue2Leaflet.LGeoJson,
    'l-marker': Vue2Leaflet.LMarker
  },
  model: {
    prop: 'bbox_value',
    event: 'change'
  },
  props: {
    initialBbox: {
      type: String,
      default: '-154,15,25,81'
    },
    geojson: {
      type: Object,
      default: function () {
        return null
      }
    },
    maxZoom: {
      type: Number,
      default: 9
    },
    readableColumns: {
      type: Object,
      default: function () {
        return {
          name: {
            col: 'STATION_NAME',
            label: this.$gettext('Station name:')
          },
          id: {
            col: null,
            label: this.$gettext('Station ID:')
          },
          prov: {
            col: null,
            label: this.$gettext('Province/Territory/State:')
          }
        }
      }
    },
    selectDisabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      epsg3978: new L.Proj.CRS('EPSG:3978', '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs', {
        resolutions: [
          38364.660062653464,
          22489.62831258996,
          13229.193125052918,
          7937.5158750317505,
          4630.2175937685215,
          2645.8386250105837,
          1587.5031750063501,
          926.0435187537042,
          529.1677250021168,
          317.50063500127004,
          185.20870375074085,
          111.12522225044451,
          66.1459656252646,
          38.36466006265346,
          22.48962831258996,
          13.229193125052918,
          7.9375158750317505,
          4.6302175937685215,
          2.6458386250105836,
          1.5875031750063502,
          0.92604351875370428,
          0.52916772500211673,
          0.31750063500127002,
          0.18520870375074083,
          0.11112522225044451,
          0.066145965625264591
        ],
        origin: [-34655800, 39310000]
      }),
      bbox_value: this.initialBbox,
      zoom: 2,
      minZoom: 0,
      maxBounds: L.latLngBounds(L.latLng(22, -170), L.latLng(90, -16)),
      // L.latLngBounds(L.latLng(16, -127), L.latLng(48, 24)), // EPSG:3978
      center: L.latLng(68, -102),
      // L.latLng(64, -90), // EPSG:3978
      urlOSM: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      options: {
        style: function () {
          return {
            weight: 2,
            color: '#ECEFF1',
            opacity: 1,
            fillColor: '#e4ce7f',
            fillOpacity: 1
          }
        }
      },
      geoJsonOptions: {
        // filter: this.filterGeoJson,
        pointToLayer: this.pointToLayer
      },
      selectedMarkerOptions: {
        radius: 5,
        fillColor: '#00FF00',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      defaultMarkerOptions: {
        radius: 5,
        fillColor: '#FFCC33',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      numStationsSelected: 0,
      toggleDetailsState: false
    }
  },
  watch: {
    selectedStationIds: function (newStations, oldStations) {
      /* Update marker styles and popups when station selection changes are made */
      let stationMarkers = this.getStationMarkers()

      if (stationMarkers === null) {
        return false // early exit
      }

      // close all popups first and reset the marker styling
      stationMarkers.forEach((marker) => {
        marker.closePopup()
        this.markDefaultPoint(marker)
      })

      if (typeof oldStations !== 'undefined') {
        stationMarkers.forEach((marker) => {
          // Show the popup of last added station
          if (marker.feature.ID === newStations[newStations.length - 1] && newStations.length > this.numStationsSelected) {
            marker.openPopup()
          }
          // Style selected stations accordingly
          if (newStations.includes(marker.feature.ID)) {
            this.markSelectedPoint(marker)
          }
        })

        this.numStationsSelected = newStations.length
      }
    },
    province: function (newProvince, oldProvince) {
      /* Update marker styles and popups when province selection changes are made */
      let stationMarkers = this.getStationMarkers()

      if (stationMarkers === null) {
        return false // early exit
      }

      // close all popups first and reset the marker styling
      stationMarkers.forEach((marker) => {
        marker.closePopup()
        this.markDefaultPoint(marker)
      })

      let routeName = this.$route.name
      let datasetToStnProvColName = {
        ahccd: 'province__province',
        hydrometric: 'PROV_TERR_STATE_LOC',
        normals: 'PROV_STATE_TERR_CODE',
        daily: 'PROV_STATE_TERR_CODE',
        monthly: 'PROV_STATE_TERR_CODE'
      }

      if (newProvince !== 'null' && datasetToStnProvColName.hasOwnProperty(routeName)) {
        let provCol = datasetToStnProvColName[routeName]
        stationMarkers.forEach((marker) => {
          // Style selected stations accordingly
          if (marker.feature.properties[provCol] === newProvince) {
            this.markSelectedPoint(marker)
          }
        })
      }
    }
  },
  mounted: function () {
    // CBMT Single tile WMS
    var map = this.$refs.BBOXMap.mapObject
    var cbmtWMS = LW.overlay(this.urlWMS_CMBT[this.$i18n.activeLocale], {
      layers: this.layerCBMT[this.$i18n.activeLocale]
    })
    cbmtWMS.addTo(map)
  },
  computed: {
    attribution: function () {
      return '&copy; ' + this.$gettext('<a href="http://osm.org/copyright">OpenStreetMap</a> contributors')
    },
    province: function () {
      return this.$store.getters.getProvince
    },
    selectedStationIds: function () {
      if (this.showGeoJson) {
        return this.$store.getters.getStationIdSelected
      }
    },
    showGeoJson: function () {
      if (this.geojson === null) {
        return false
      } else {
        return true
      }
    },
    urlWMTS_CMBT: function () {
      return {
        en: 'https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBMT3978/MapServer/WMTS/tile/1.0.0/BaseMaps_CBMT3978/default/default028mm/{z}/{y}/{x}.jpg',
        fr: 'https://geoappext.nrcan.gc.ca/arcgis/rest/services/BaseMaps/CBCT3978/MapServer/WMTS/tile/1.0.0/BaseMaps_CBCT3978/default/default028mm/{z}/{y}/{x}.jpg'
      }
    },
    layerCBMT: function () {
      return {
        en: 'CBMT',
        fr: 'CBCT'
      }
    },
    urlWMS_CMBT: function () {
      return {
        en: 'https://geogratis.gc.ca/maps/CBMT?',
        fr: 'https://geogratis.gc.ca/cartes/CBCT?'
      }
    }
  },
  methods: {
    toggleDetails: function (event) {
      this.toggleDetailsState = !this.toggleDetailsState
    },
    updateBBOX: function (event) {
      this.$emit('change', this.bbox_value)
    },
    updateBBOXfromMap: function (event) {
      this.bbox_value = this.$refs.BBOXMap.mapObject.getBounds().toBBoxString()
      this.updateBBOX(null)
    },
    markSelectedPoint: function (marker) {
      marker
        .bringToFront()
        .setStyle(this.selectedMarkerOptions)
        .redraw()
    },
    markDefaultPoint: function (marker) {
      marker
        .setStyle(this.defaultMarkerOptions)
        .redraw()
    },
    pointToLayer: function (feature, latlng) {
      var cmp = this
      var popupTextHtml = '<strong>' + feature.properties[this.readableColumns.name.col] + '</strong>'

      if (this.readableColumns.id.col !== null) {
        popupTextHtml += '<br>' + this.readableColumns.id.label + ' ' + feature.properties[this.readableColumns.id.col]
      }
      if (this.readableColumns.prov.col !== null) {
        popupTextHtml += '<br>' + this.readableColumns.prov.label + ' ' + feature.properties[this.readableColumns.prov.col]
      }
      var stationMarker = null
      stationMarker = L.circleMarker(latlng, this.defaultMarkerOptions)

      // Add popup content
      stationMarker.bindPopup(popupTextHtml)

      // add event when marker opens
      stationMarker.on('popupopen', function (evt) {
        // remember station id selected
        if (!cmp.selectedStationIds.includes(feature.ID) && !cmp.selectDisabled) {
          store.dispatch('addStationIdSelected', feature.ID)
        }
      })
      return stationMarker
    },
    filterGeoJson: function (geoJsonFeature) {
      return this.selectedStationIds.includes(geoJsonFeature.properties.IDENTIFIER)
    },
    activeClass: function (statusEn) {
      if (statusEn === 'Active') {
        return 'station_active'
      } else {
        return 'station_inactive'
      }
    },
    resetBBOX: function (clickEvt) {
      this.$refs.BBOXMap.mapObject.setView(this.center, this.zoom)
    },
    getStationMarkers: function () {
      let stationMarkers = null
      if (this.$refs.hasOwnProperty('geojsonLayer')) {
        if (this.$refs.geojsonLayer.hasOwnProperty('mapObject')) {
          stationMarkers = this.$refs.geojsonLayer.mapObject.getLayers()
        }
      }
      return stationMarkers
    }
  }
}
</script>

<style src="../../node_modules/leaflet/dist/leaflet.css"></style>
<style scoped>
#bbox-map, #bbox-map2 {
  width: 400px;
  height: 400px;
  background-color: #FFF;
}
#bbox-map:focus {
  outline-color: #07F;
  outline-style: solid;
  outline-width: 2px;
}
</style>
