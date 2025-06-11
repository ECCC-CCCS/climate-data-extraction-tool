<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-translate>Adjusted and Homogenized Canadian Climate Data (AHCCD) are climate station datasets that incorporate adjustments (derived from statistical procedures) to the original historical station data to account for discontinuities from non-climatic factors, such as instrument changes or station relocation. Data are provided for temperature, precipitation, pressure and wind speed. Station trend data are provided when available. Trends are calculated using the Theil-Sen method using the station's full period of available data. The availability of trends will vary by station; if more than 5 consecutive years are missing data or more than 10% of the data within the time series is missing, a trend was not calculated.</p>

    <tips-using-tool></tips-using-tool>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-html="techDocHtml"></p>

      <p v-html="openPortalHtml"></p>

      <station-list-link
        :url-station-list="urlStationList + '&limit=' + oapif_station_limit"
        :download-text="$gettext('Download a list of detailed information for each AHCCD station.')"></station-list-link>
    </details>

    <data-access-doc-link></data-access-doc-link>

    <details>
      <summary id="map-filters-header" v-translate>Map filters</summary>

      <province-select
        v-model="oapif_province"></province-select>

      <fieldset
        id="date-range-field"
        v-show="oapif_layer !== 'ahccd-trends'">
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
    </details>

    <bbox-map
      v-model="mapBBOX"
      :max-zoom="18"
      :readable-columns="popup_props_display"
      :geojson="ahccdStationGeoJson"
      :stn-primary-id="stnPrimaryId"
      :date-start-prop="prop_date_start"
      :date-end-prop="prop_date_end"
      :use-date-range-filter="true"></bbox-map>

    <station-select
      v-model="oapif_selected_station_ids"
      :station-data="ahccdStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"
      :date-start-prop="prop_date_start"
      :date-end-prop="prop_date_end"
      :use-date-range-filter="true"></station-select>

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
      :ows-url-formatter="getOapifDownloadURL"
      :oapif-common-url="getOapifCommonURL(oapif_layer)"
      :oapi-download-limit="oapif_limit"
      :layer-format="oapif_format"
      :has-errors="hasErrors"
      :download-context="downloadContext">
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
  name: 'AHCCDForm',
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
      oapif_layer: 'ahccd-annual',
      oapif_layer_station: 'ahccd-stations',
      date_start: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc('2020-12-31', 'YYYY-MM-DD').toDate(),
      date_min: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_max: this.$moment.utc('2020-12-31', 'YYYY-MM-DD').toDate(),
      prop_date_start: 'start_date__date_debut',
      prop_date_end: 'end_date__date_fin'
    }
  },
  watch: {
    oapif_province: function (newVal) {
      this.$store.dispatch('stations/changeProvince', newVal) // to share with bbox
    },
    mapBBOX: function (newVal) {
      this.$store.dispatch('map/changeBBOX', newVal) // to share with station select table
    }
  },
  beforeMount () {
    // Load ahccd stations
    if (this.numStationAhccd === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveAhccdStations', {
        url: this.urlStationMapList
      })
    }

    // Trigger save to store
    this.date_start = this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate()
    this.date_end = this.$moment.utc('2020-12-31', 'YYYY-MM-DD').toDate()
  },
  computed: {
    urlStationList: function () {
      return this.oapif_url_base + '/' + this.oapif_layer_station + '/items?f=json'
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
      props[this.prop_date_start] = this.$gettext('First date')
      props[this.prop_date_end] = this.$gettext('Last date')
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
      selLayer[this.oapif_layer] = this.layer_options[this.oapif_layer]
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
        },
        dateRange: {
          colStart: this.prop_date_start,
          colEnd: this.prop_date_end,
          label: this.$gettext('Date range') + this.$pgettext('Colon', ':'),
          format: this.dateConfigs.format
        }
      }
    },
    dateConfigs: function () {
      if (this.oapif_layer === 'ahccd-annual' || this.oapif_layer === 'ahccd-seasonal') {
        return {
          minimumView: 'year',
          format: 'YYYY',
          placeholder: 'YYYY'
        }
      } else if (this.oapif_layer === 'ahccd-monthly') {
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
      if (this.oapif_layer === 'ahccd-trends') {
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
      if (this.oapif_layer === 'ahccd-trends') {
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
