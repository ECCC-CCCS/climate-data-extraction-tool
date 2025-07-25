<template>
  <div id="bbox-map-container">
    <fieldset v-if="allowClickPoint">
      <legend v-translate>Spatial selection download</legend>

      <option-radio
        v-model="pointClickOn"
        :label="$gettext('Map selection type')"
        :radio-inline="true"
        :radio-options="pointClickOptions"></option-radio>
    </fieldset>

    <strong
      v-show="clickLatLng === null && pointClickOn === 'yes'"
      class="warning">
      <span class="label label-warning">
        <span class="prefix"></span>
        <translate>Please select a point on the map.</translate>
      </span>
    </strong>

    <strong
      v-show="allowClickPoint && pointClickOn === 'off'"
      class="info">
      <span class="label label-info">
        <span class="prefix"></span>
        <translate>The downloaded area will match the area shown in the map.</translate>
      </span>
    </strong>

    <details>
      <summary v-translate>How to use: interactive map</summary>
      <p v-translate>Use this map to select a geographic subset of the data. The geographic subset of the downloaded data will match the area shown in the map.</p>
      <p><strong v-translate>Panning:</strong>
        <span v-translate
          t-comment="<kbd>Tab</kbd> represents the keyboard button name">To pan the map, click and drag over the interactive map. Alternatively, <kbd>tab</kbd> focus to the interactive map box and then press the arrow keys.</span>
      </p>
      <p><strong v-translate>Zooming:</strong>
        <span v-translate t-comment="<kbd> tags represent a keyboard button name. Do not adjust spacing.">To zoom in and out of the map, mouse scroll up and down while you mouse over the interactive map or click on the <kbd><abbr title="Plus Sign">+</abbr></kbd> and <kbd><abbr title="Minus Sign">-</abbr></kbd> buttons respectively. Alternatively, <kbd>tab</kbd> focus to the interactive map box and then press the <kbd><abbr title="Plus Sign">+</abbr></kbd> or <kbd><abbr title="Minus Sign">-</abbr></kbd> keys.</span>
      </p>
    </details>

    <div id="bbox-map-parent" class="vld-parent">
      <loading id="map-loading-screen" :active.sync="isLoadingStations" :is-full-page="false" aria-busy="true" role="alert"></loading>
      <span v-if="isLoadingStations" class="hidden"><translate>Loading stations... please wait</translate></span>
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
        @click="mapClick"
        >
          <!-- <l-tile-layer :url="urlWMTS_CMBT[$i18n.activeLocale]"></l-tile-layer> -->
          <!-- <l-geo-json ref="geojsonLayer" :geojson="geojson" :options="geoJsonOptions"></l-geo-json> -->

          <l-marker
            title="Popover Title"
            :lat-lng="clickLatLng"
            ref="clickMarker"
            v-if="clickLatLng !== null && allowClickPoint">
            <l-popup
              ref="clickMarkerPopup">
              <translate>Longitude:</translate> {{ clickLatLng.lng.toFixed(4) }}<br>
              <translate>Latitude:</translate> {{ clickLatLng.lat.toFixed(4) }}
            </l-popup>
          </l-marker>

          <l-control
            position="bottomleft"
            disableClickPropagation>
            <button
              id="reset-map-view"
              @click="resetBBOX"
              type="button"
              :disabled="selectDisabled || isLoadingStations"
              class="btn btn-primary btn-xs"><span class="glyphicon glyphicon-refresh"></span> <translate>Reset map</translate></button>
          </l-control>
      </l-map>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import { LMap, LMarker, LPopup, LControl } from 'vue2-leaflet'
import LW from 'leaflet.wms'
import 'leaflet.markercluster'
import 'proj4leaflet'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import { mapState, mapGetters } from 'vuex'

import OptionRadio from './OptionRadio'

// Default icon settings
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

L.MarkerCluster.addInitHook(function () {
  this.options.keyboard = false
})

const INIT_BBOX = '-165,18,-20,87'

export default {
  name: 'BBOXMap',
  components: {
    LMap,
    LMarker,
    LPopup,
    LControl,
    OptionRadio,
    Loading
  },
  model: {
    prop: 'bbox_value',
    event: 'change'
  },
  props: {
    allowClickPoint: {
      type: Boolean,
      default: false
    },
    fileFormats: {
      type: Object,
      default: function () {
        return {
          'json': 'CoverageJSON'
        }
      }
    },
    initialBbox: {
      type: String,
      default: INIT_BBOX
    },
    geojson: {
      type: Object,
      default: function () {
        return null
      }
    },
    stnPrimaryId: { // geojson feature.properties[primary-id]
      type: String,
      default: 'ID'
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
            label: '' // this.$gettext('Station name:')
          },
          id: {
            col: null,
            label: '' // this.$gettext('Station ID:')
          },
          prov: {
            col: null,
            label: '' // this.$gettext('Province/Territory/State:')
          }
        }
      }
    },
    selectDisabled: {
      type: Boolean,
      default: false
    },
    hydroStationDisplay: { // special display purposes for hydro stations
      type: Boolean,
      default: false
    },
    dateStartProp: {
      type: String,
      default: null
    },
    dateEndProp: {
      type: String,
      default: null
    },
    useDateRangeFilter: {
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
      windowWidth: window.innerWidth,
      bbox_value: this.initialBbox,
      moveendPause: false,
      zoom: 3,
      minZoom: 0,
      maxBounds: L.latLngBounds(L.latLng(20, -175), L.latLng(90, -10)),
      center: L.latLng(66, -105),
      markerClusters: L.markerClusterGroup({
        disableClusteringAtZoom: 9,
        chunkedLoading: true,
        chunkInterval: 500
      }),
      geojsonLayer: L.geoJSON(null, this.geoJsonOptions),
      urlOSM: 'https://{s}.tile.osm.org/{z}/{x}/{y}.png',
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
        pointToLayer: this.pointToLayer,
        filter: this.filterGeoJson
      },
      selectedMarkerOptions: {
        radius: 6,
        fillColor: '#00FF00',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      defaultMarkerOptions: {
        radius: 6,
        fillColor: '#FFCC33',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      inactiveMarkerOptions: {
        radius: 6,
        fillColor: '#CC0000',
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      },
      cbmtAttributionURL: {
        'en': 'https://open.canada.ca/data/en/dataset/296de17c-001c-4435-8f9a-f5acab632e85',
        'fr': 'https://ouvert.canada.ca/data/fr/dataset/296de17c-001c-4435-8f9a-f5acab632e85'
      },
      numStationsSelected: 0,
      pointClickOn: 'off',
      clickLatLng: null,
      datasetToStnProvColName: { // province property name in station data is different than the province property name in the actual dataset
        ahccd: 'province__province',
        hydrometric: 'PROV_TERR_STATE_LOC',
        normals: 'PROV_STATE_TERR_CODE',
        daily: 'PROV_STATE_TERR_CODE',
        hourly: 'PROV_STATE_TERR_CODE',
        monthly: 'PROV_STATE_TERR_CODE',
        ltce: 'PROVINCE_CODE'
      }
    }
  },
  watch: {
    pointClickOn: function (newStatus) {
      if (newStatus === 'yes') {
        this.resetPointClick(true)
      } else {
        this.resetPointClick(false)
      }
    },
    stationIdSelected: function (newStations, oldStations) {
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
          if (marker.feature.properties[this.stnPrimaryId] === newStations[newStations.length - 1] && newStations.length > this.numStationsSelected) {
            marker.openPopup()
          }
          // Style selected stations accordingly
          if (newStations.includes(marker.feature.properties[this.stnPrimaryId])) {
            this.markSelectedPoint(marker)
          }
        })
      }
    },
    province: function (newProvince) {
      this.reAddGeoJsonLayer() // update geojson layer for new province selection

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

      if (newProvince !== 'null') {
        // this.selectMarkersByProvince(newProvince, stationMarkers)
        // If province selected, zoom to province features
        let map = this.$refs.BBOXMap.mapObject
        map.fitBounds(this.geojsonLayer.getBounds())
      } else if (newProvince === 'null') {
        this.resetBBOX()
      }
    },
    geojson: function (newJson) {
      if (newJson !== undefined) { // update geojson layer if new data
        this.reAddGeoJsonLayer()
      }
    },
    dateStart: function (newDate, oldDate) {
      // prevent triggering on initial load
      if (oldDate != null && newDate != null && this.useDateRangeFilter) {
        this.reAddGeoJsonLayer()
      }
    },
    dateEnd: function (newDate, oldDate) {
      // prevent triggering on initial load
      if (oldDate != null && newDate != null && this.useDateRangeFilter) {
        this.reAddGeoJsonLayer()
      }
    },
    windowWidth: function (newWidth) {
      // adjust initial/reset zoom level for smaller screen sizes
      if (newWidth <= 560) {
        this.zoom = 2
      } else {
        this.zoom = 3
      }
    }
  },
  mounted: function () {
    this.$nextTick(() => {
      let map = this.$refs.BBOXMap.mapObject

      // CBMT Single tile WMS
      let cbmtWMS = LW.overlay(this.urlWMS_CMBT[this.$i18n.activeLocale], {
        layers: this.layerCBMT[this.$i18n.activeLocale],
        attribution: this.attributionCBMT
      })
      cbmtWMS.addTo(map)

      if (this.geojson !== null) {
        // add marker-clustering
        let map = this.$refs.BBOXMap.mapObject
        this.geojsonLayer = L.geoJSON(this.geojson, this.geoJsonOptions)
        this.markerClusters.clearLayers().addLayer(this.geojsonLayer)
        map.addLayer(this.markerClusters)
      }
    })

    // reset point click
    this.resetPointClick(false)

    // reset bbox value
    this.$store.dispatch('map/changeBBOX', this.bbox_value)

    // window resize
    window.addEventListener('resize', this.onResize)

    // Unset flag on leaflet map before the attribution text
    let map = this.$refs.BBOXMap.mapObject
    map.attributionControl.setPrefix('<a href="https://leafletjs.com/" target="_blank">Leaflet</a>')

  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  computed: {
    ...mapGetters('stations', [
      'dateStart',
      'dateEnd'
    ]),
    pointClickError: function () {
      if (this.pointClickOn === 'yes' && this.clickLatLng === null) {
        return true
      } else {
        return false
      }
    },
    pointClickOptions: function () {
      let oapicFormats = Object.values(this.fileFormats)
      return {
        'yes': this.$gettext('A single location as a CSV or GeoJSON'),
        'off': this.$_i(this.$pgettext('Template for different file formats', 'A region as a {format1} or {format2}'), {format1: oapicFormats[0], format2: oapicFormats[1]})
      }
    },
    attributionOSM: function () {
      return '&copy; ' + this.$gettext('<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
    },
    attributionCBMT: function () {
      return '<a href="' + this.cbmtAttributionURL[this.$i18n.activeLocale] + '" target="_blank">' + this.$pgettext('Title', 'Canada Base Map Transportation') + '</a>'
    },
    ...mapState('stations', {
      province: 'province',
      isLoadingStations: 'isLoadingStations',
      stationIdSelected (state) {
        if (this.showGeoJson) {
          return state.stationIdSelected
        } else {
          return []
        }
      }
    }),
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
        en: 'https://maps.geogratis.gc.ca/wms/CBMT?',
        fr: 'https://cartes.geogratis.gc.ca/wms/CBCT?'
      }
    }
  },
  methods: {
    selectMarkersByProvince: function (selProvince, stationMarkers) {
      if (selProvince !== 'null' && Object.prototype.hasOwnProperty.call(this.datasetToStnProvColName, this.$route.name)) {
        let provCol = this.datasetToStnProvColName[this.$route.name]
        stationMarkers.forEach((marker) => {
          // Style selected stations accordingly
          if (marker.feature.properties[provCol] === selProvince) {
            this.markSelectedPoint(marker)
          }
        })
      }
    },
    resetPointClick: function (newStatus) {
      this.$store.dispatch('map/setPointClickStatus', newStatus)
      if (newStatus === false) {
        this.clickLatLng = null
        this.$store.dispatch('map/setClickLatLng', this.clickLatLng)
      }
    },
    mapClick: function (event) {
      if (this.pointClickOn === 'yes') {
        this.clickLatLng = event.latlng
        this.$store.dispatch('map/setClickLatLng', this.clickLatLng)
      }
    },
    updateBBOX: function () {
      this.$emit('change', this.bbox_value)
    },
    updateBBOXfromMap: function () {
      if (this.moveendPause) {
        return false
      }
      if (Object.prototype.hasOwnProperty.call(this.$refs, 'BBOXMap')) {
        if (Object.prototype.hasOwnProperty.call(this.$refs.BBOXMap, 'mapObject')) {
          let bboxBounds = this.$refs.BBOXMap.mapObject.getBounds()
          // ensure BBOX are within proper lat/lng ranges
          let fixedBbox = {
            west: bboxBounds.getWest() < -180 ? -180 : bboxBounds.getWest(), // lng
            south: bboxBounds.getSouth() < -90 ? -90 : bboxBounds.getSouth(), // lat
            east: bboxBounds.getEast() > 180 ? 180 : bboxBounds.getEast(), // lng
            north: bboxBounds.getNorth() > 90 ? 90 : bboxBounds.getNorth() // lat
          }
          let fixedBounds = L.latLngBounds(L.latLng(fixedBbox.south.toFixed(3), fixedBbox.west.toFixed(3)), L.latLng(fixedBbox.north.toFixed(3), fixedBbox.east.toFixed(3)))
          this.bbox_value = fixedBounds.toBBoxString()
          this.updateBBOX()
        }
      }
    },
    markSelectedPoint: function (marker) {
      marker
        .bringToFront()
        .setStyle(this.selectedMarkerOptions)
        .redraw()
    },
    markDefaultPoint: function (marker) {
      let defaultStyle = this.defaultMarkerOptions
      if (this.hydroStationDisplay) {
        if (marker.feature.properties.STATUS_EN !== 'Active') {
          defaultStyle = this.inactiveMarkerOptions
        }
      }
      marker
        .setStyle(defaultStyle)
        .redraw()
    },
    pointToLayer: function (feature, latlng) {
      let this_ = this
      let popupTextHtml = '<strong>' + feature.properties[this.readableColumns.name.col] + '</strong>'

      if (this.readableColumns.id.col !== null) {
        popupTextHtml += '<br>' + this.readableColumns.id.label + ' ' + feature.properties[this.readableColumns.id.col]
      }
      if (this.readableColumns.prov.col !== null) {
        popupTextHtml += '<br>' + this.readableColumns.prov.label + ' ' + feature.properties[this.readableColumns.prov.col]
      }
      if (Object.prototype.hasOwnProperty.call(this.readableColumns, 'dateRange')) {
        const format = this.readableColumns.dateRange.format
        popupTextHtml += '<br>' + this.readableColumns.dateRange.label + ' ' + this.$moment.utc(feature.properties[this.readableColumns.dateRange.colStart]).format(format) + ' ' + this.$gettext('to') + ' ' + this.$moment.utc(feature.properties[this.readableColumns.dateRange.colEnd]).format(format)
      }

      let stationMarker = null
      let markerOption = this.defaultMarkerOptions
      if (this.hydroStationDisplay && feature.properties.STATUS_EN !== 'Active') {
        markerOption = this.inactiveMarkerOptions
      }
      stationMarker = L.circleMarker(latlng, markerOption)

      // Add popup content
      stationMarker.bindPopup(popupTextHtml)

      // add click event to marker for station selection/deselection
      stationMarker.on('click', function () {
        if (this_.stationIdSelected.includes(feature.properties[this_.stnPrimaryId])) {
          this_.$store.dispatch('stations/removeStationIdSelected', feature.properties[this_.stnPrimaryId])
        } else if (!this_.stationIdSelected.includes(feature.properties[this_.stnPrimaryId]) && !this_.selectDisabled) {
          this_.$store.dispatch('stations/addStationIdSelected', feature.properties[this_.stnPrimaryId])
        }
      })
      return stationMarker
    },
    filterGeoJson: function (geoJsonFeature) {
      return this.dateRangeFilter(geoJsonFeature) &&
        this.provinceFilter(geoJsonFeature)
    },
    activeClass: function (statusEn) {
      if (statusEn === 'Active') {
        return 'station_active'
      } else {
        return 'station_inactive'
      }
    },
    resetBBOX: function () {
      this.moveendPause = true
      this.$refs.BBOXMap.mapObject.setView(this.center, this.zoom)
      this.bbox_value = INIT_BBOX
      this.updateBBOX()
      setTimeout(() => {
        this.moveendPause = false
      }, 900) // resume moveend event after a delay
    },
    getStationMarkers: function () {
      let stationMarkers = this.geojsonLayer.getLayers()
      return stationMarkers
    },
    onResize: function () {
      this.windowWidth = window.innerWidth
    },
    reAddGeoJsonLayer: function () {
      // re-add layer to update new display of geoJson features
      let map = this.$refs.BBOXMap.mapObject
      this.geojsonLayer = L.geoJSON(this.geojson, this.geoJsonOptions)
      this.markerClusters.clearLayers().addLayer(this.geojsonLayer)
      map.addLayer(this.markerClusters)
    },
    selectedFilter: function (geoJsonFeature) {
      return this.stationIdSelected.includes(geoJsonFeature.properties.IDENTIFIER)
    },
    provinceFilter: function (geoJsonFeature) {
      if (this.province == 'null') {
        return true
      }
      const provCol = this.datasetToStnProvColName[this.$route.name]
      return geoJsonFeature.properties[provCol] === this.province
    },
    dateRangeFilter: function (geoJsonFeature) {
      // date values use momentjs for filtering comparison
      const rowDateStart = this.$moment.utc(geoJsonFeature.properties[this.dateStartProp])
      const rowDateEnd = this.$moment.utc(geoJsonFeature.properties[this.dateEndProp])
      // console.log('Date start: ' + this.dateStart + ' | Date end: ' + this.dateEnd + '\nrow start date: ' + rowDateStart+ ' | row end date: ' + rowDateEnd)

      // no date range filter applied
      // initial
      if (this.dateStart == null || this.dateEnd == null || !this.useDateRangeFilter) {
        return true
      }
      // date ranges are empty
      if (!this.dateStart.isValid() && !this.dateEnd.isValid()) {
        return true
      }

      // within range completely
      if (this.dateStart.isSameOrAfter(rowDateStart) && this.dateEnd.isSameOrBefore(rowDateEnd)) {
        return true
      // within range of end date only
      } else if (this.dateStart.isBefore(rowDateStart)) {
        if (this.dateEnd.isSameOrAfter(rowDateStart)) {
          return true
        } else {
          return false
        }
      // within range of start date only
      } else if (this.dateEnd.isAfter(rowDateEnd)) {
        if (this.dateStart.isSameOrBefore(rowDateEnd)) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    }
  }
}
</script>

<style src="../../node_modules/leaflet/dist/leaflet.css"></style>
<style src="../../node_modules/leaflet.markercluster/dist/MarkerCluster.css"></style>
<style src="../../node_modules/leaflet.markercluster/dist/MarkerCluster.Default.css"></style>
<style scoped>
#bbox-map {
  width: 100%;
  height: 500px;
  background-color: #FFF;
}
#bbox-map:focus {
  outline-color: #07F;
  outline-style: solid;
  outline-width: 2px;
}
</style>
