<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p>{{ textIntroTip.station.instructions }}</p>
    <tips-using-tool></tips-using-tool>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary v-translate>Dataset description, technical information and metadata</summary>
      <p v-translate>Adjusted and Homogenized Canadian Climate Data (AHCCD) are climate station datasets that incorporate adjustments (derived from statistical procedures) to the original historical station data to account for discontinuities from non-climatic factors, such as instrument changes or station relocation. Data are provided for temperature, precipitation, pressure and wind speed. Station trend data are provided when available. Trends are calculated using the Theil-Sen method using the station's full period of available data. The availability of trends will vary by station; if more than 5 consecutive years are missing data or more than 10% of the data within the time series is missing, a trend was not calculated.</p>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>

      <station-list-link
        :url-station-list="urlStationList"
        :download-text="$gettext('Download a list of detailed information for each AHCCD station.')"></station-list-link>
    </details>

    <info-contact-support></info-contact-support>

    <bbox-map
      v-model="ows_bbox"
      :max-zoom="18"
      :readable-columns="popup_props_display"
      :select-disabled="provinceSelected"
      :geojson="ahccdStationGeoJson"
      :stn-primary-id="stnPrimaryId"></bbox-map>

    <province-select
      v-model="wfs_province"></province-select>

    <station-select
      v-model="wfs_selected_station_ids"
      :select-disabled="provinceSelected"
      :station-data="ahccdStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"></station-select>

    <var-select
      class="mrgn-tp-md"
      v-model="wfs_layer"
      :label="$gettext('Value type / Time interval')"
      :required="true"
      :select-options="layer_options"></var-select>

    <fieldset
      id="date-range-field"
      v-show="wfs_layer !== 'ahccd-trends'">
      <legend v-translate>Date range</legend>
      <date-select
        v-model="date_start"
        :label="$gettext('Start date')"
        :minimum-view="dateConfigs.minimumView"
        :format="dateConfigs.format"
        :min-date="date_min"
        :max-date="date_max"
        :custom-error-msg="dateRangeErrorMessage"
        :placeholder="dateConfigs.placeholder"></date-select>

      <date-select
        v-model="date_end"
        :label="$gettext('End date')"
        :minimum-view="dateConfigs.minimumView"
        :format="dateConfigs.format"
        :min-date="date_min"
        :max-date="date_max"
        :custom-error-msg="dateRangeErrorMessage"
        :placeholder="dateConfigs.placeholder"></date-select>

      <button
        id="clear-dates-btn"
        class="btn btn-default"
        type="button"
        @click="clearDates"
        v-translate>Clear dates</button>
    </fieldset>

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
import { wfs } from '@/components/mixins/wfs.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AHCCDForm',
  mixins: [wfs, ows, datasets],
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
      wfs_layer: 'ahccd-annual',
      wfs_layer_station: 'ahccd-stations',
      date_start: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc('2020-12-31', 'YYYY-MM-DD').toDate(),
      date_min: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_max: this.$moment.utc('2020-12-31', 'YYYY-MM-DD').toDate()
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
    // Load ahccd stations
    if (this.numStationAhccd === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveAhccdStations', this.urlStationMapList)
    }
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?f=json&limit=' + this.wfs_station_limit
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]},start_date__date_debut,end_date__date_fin`
    },
    ...mapState('stations', [
      'ahccdStationGeoJson'
    ]),
    ...mapGetters('stations', [
      'numStationAhccd'
    ]),
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Station ID')
      props[this.datasetToProvColName[this.$route.name]] = this.$gettext('Province') + '&nbsp/<br>' + this.$gettext('Territory')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      props['start_date__date_debut'] = this.$gettext('First date')
      props['end_date__date_fin'] = this.$gettext('Last date')
      return props
    },
    layer_options: function () {
      return {
        'ahccd-annual': this.$gettext('Annual values'),
        'ahccd-seasonal': this.$gettext('Seasonal values'),
        'ahccd-monthly': this.$gettext('Monthly values'),
        'ahccd-trends': this.$gettext('Trend values')
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
      if (this.wfs_layer === 'ahccd-annual' || this.wfs_layer === 'ahccd-seasonal') {
        return {
          minimumView: 'year',
          format: 'YYYY',
          placeholder: 'YYYY'
        }
      } else if (this.wfs_layer === 'ahccd-monthly') {
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
    hasErrors: function () {
      // special case to ignore date errors for trends
      if (this.wfs_layer === 'ahccd-trends') {
        return false
      } else {
        return this.dateRangeHasBadRange ||
          this.dateRangePastLimits ||
          this.dateStartIsEmptyOnly ||
          this.dateEndIsEmptyOnly
      }
    },
    temporal: function () {
      // return the temporal param depending on which ahccd layer is selected
      if (this.wfs_layer === 'ahccd-trends') {
        return null
      } else if (this.dateRangeIsValid) {
        let format = this.dateConfigs.format
        let start = this.$moment.utc(this.date_start, format).format(format)
        let end = this.$moment.utc(this.date_end, format).format(format)
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
