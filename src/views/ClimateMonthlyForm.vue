<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <p v-translate>Monthly climate summaries are cross-country summaries of the averages and extremes for the month, including precipitation totals, max-min temperatures, and degree days. These data are available from stations that produce daily data.</p>

    <div class="alert alert-info">
      <p v-html="htmlNoteMoreData"></p>
    </div>

    <tips-using-tool></tips-using-tool>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>

      <station-list-link
        :url-station-list="urlStationList"
        :download-text="$gettext('Download a list of detailed information for each Monthly climate summaries station.')"></station-list-link>
    </details>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Map filters</summary>

      <province-select
        v-model="wfs_province"></province-select>

      <fieldset>
        <legend v-translate>Date range</legend>
        <date-select
          v-model="date_start"
          :label="$gettext('Start date')"
          :placeholder="$gettext('YYYY-MM-DD')"
          :minimum-view="dateConfigs.minimumView"
          :format="dateConfigs.format"
          :min-date="date_min"
          :max-date="date_max"
          :custom-error-msg="dateRangeErrorMessage"></date-select>

        <date-select
          v-model="date_end"
          :label="$gettext('End date')"
          :placeholder="$gettext('YYYY-MM-DD')"
          :minimum-view="dateConfigs.minimumView"
          :format="dateConfigs.format"
          :min-date="date_min"
          :max-date="date_max"
          :custom-error-msg="dateRangeErrorMessage"></date-select>

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
      :geojson="climateMonthlyStationGeoJson"
      :stn-primary-id="stnPrimaryId"></bbox-map>

    <station-select
      v-model="wfs_selected_station_ids"
      :select-disabled="provinceSelected"
      :station-data="climateMonthlyStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"
      :date-start-prop="prop_date_start"
      :date-end-prop="prop_date_end"
      :use-date-range-filter="true"></station-select>

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
import DateSelect from '@/components/DateSelect.vue'
import URLBox from '@/components/URLBox.vue'
import StationListLink from '@/components/StationListLink.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import MoreResources from '@/components/MoreResources.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import { wfs } from '@/components/mixins/wfs.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import axios from 'axios'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'ClimateMonthlyForm',
  mixins: [wfs, ows, datasets],
  components: {
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
      wfs_layer: 'climate-monthly',
      wfs_layer_station: 'climate-stations',
      date_start: this.$moment.utc('1908-02-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_end: this.$moment.utc().toDate(),
      date_min: this.$moment.utc('1908-02-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_max: this.$moment.utc().toDate(),
      prop_date_start: 'DLY_FIRST_DATE',
      prop_date_end: 'DLY_LAST_DATE'
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
    if (this.numStationClimateMonthly === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveClimateMonthlyStations', this.urlStationMapList)
    }

    // Get min local_date dynamically to set date_min
    let minDate = this.$store.getters['stations/getClimateMonthlyMinDate']
    if (minDate === null) { // prevent duplicate AJAX
      let this_ = this // for reference in axios response; "this" reserved in axios

      axios.get(this.urlDatasetMinDate)
        .then(function (response) {
          if (Object.prototype.hasOwnProperty.call(response.data, 'features')) {
            minDate = response.data.features[0].properties.LOCAL_DATE
            this_.$store.dispatch('stations/setClimateMonthlyMinDate', minDate)
            this_.date_start = this_.$moment.utc(minDate, 'YYYY-MM').toDate()
            this_.date_min = this_.$moment.utc(minDate, 'YYYY-MM').toDate()
            this_.date_end = this_.$moment.utc(this_.date_end).toDate() // initialize dateEnd in store
          }
        })
    } else {
      this.date_start = this.$moment.utc(minDate, 'YYYY-MM').toDate()
      this.date_min = this.$moment.utc(minDate, 'YYYY-MM').toDate()
    }
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?HAS_MONTHLY_SUMMARY=Y&f=json&limit=' + this.wfs_station_limit
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]},DLY_FIRST_DATE,DLY_LAST_DATE`
    },
    urlDatasetMinDate: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer + '/items?sortby=LOCAL_DATE&limit=1&f=json'
    },
    ...mapState('stations', [
      'climateMonthlyStationGeoJson'
    ]),
    ...mapGetters('stations', [
      'numStationClimateMonthly'
    ]),
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Climate ID')
      props['PROV_STATE_TERR_CODE'] = this.$gettext('Province') + '&nbsp/<br>' + this.$gettext('Territory')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      props[this.prop_date_start] = this.$gettext('First date')
      props[this.prop_date_end] = this.$gettext('Last date')
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
          label: this.$gettext('Province') + ' / ' + this.$gettext('Territory') + this.$pgettext('Colon', ':')
        },
        dateRange: {
          colStart: this.prop_date_start,
          colEnd: this.prop_date_end,
          label: this.$gettext('Date range') + this.$pgettext('Colon', ':'),
          format: this.dateConfigs.format
        }
      }
    },
    htmlNoteMoreData: function () {
      const url = {
        en: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_EN + '/prods_servs/cdn_climate_summary_e.html',
        fr: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_FR + '/prods_servs/cdn_climate_summary_f.html'
      }
      const website = `<a href="${url[this.$i18n.activeLocale]}" target="_blank">` + this.$pgettext('a phrase that is mid sentence', 'Government of Canada Historical Climate Data website') + '</a>'
      return this.$_i(this.$gettext('Monthly climate summaries by province/territory are available for download on the {website}. The summaries available on each website are derived from the same data but some climate parameters are presented differently.'), {website: website})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
