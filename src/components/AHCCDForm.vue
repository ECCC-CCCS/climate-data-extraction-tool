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

        <details v-bind:open="toggleDetailsState">
          <summary v-on:click="toggleDetails"
            v-translate>Dataset description</summary>
          <p v-translate>Adjusted and Homogenized Canadian Climate Data (AHCCD) are climate station datasets that incorporate adjustments (derived from statistical procedures) to the original historical station data to account for discontinuities from non-climatic factors, such as instrument changes or station relocation. Data are provided for temperature, precipitation, pressure and wind speed. Station trend data are provided when available. Trends are calculated using the Theil-Sen method using the station's full period of available data. The availability of trends will vary by station; if more than 5 consecutive years are missing data or more than 10% of the data within the time series is missing, a trend was not calculated.</p>

          <p v-html="techDocHtml"></p>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-bind:readable-columns="popup_props_display"
          v-bind:select-disabled="provinceSelected"
          v-bind:geojson="ahccdStationsGeoJson"></bbox-map>

        <province-select
          v-model="wfs_province"></province-select>

        <station-select
          v-model="wfs_selected_station_ids"
          v-if="ahccdStationsGeoJson !== null"
          v-bind:select-disabled="provinceSelected"
          v-bind:station-data="ahccdStationsGeoJson.features"
          v-bind:station-prop-display="station_props_display"></station-select>

        <var-select
          class="mrgn-tp-md"
          v-model="wfs_layer"
          v-bind:label="$gettext('Value type / Time interval')"
          v-bind:required="true"
          v-bind:select-options="layer_options"></var-select>

        <fieldset
          v-show="wfs_layer !== 'ahccd-trends'">
          <legend v-translate>Date range</legend>
          <date-select
            v-model="date_start"
            v-bind:label="$gettext('Start date')"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:custom-error-msg="dateRangeErrorMessage"
            v-bind:placeholder="dateConfigs.placeholder"></date-select>

          <date-select
            v-model="date_end"
            v-bind:label="$gettext('End date')"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:custom-error-msg="dateRangeErrorMessage"
            v-bind:placeholder="dateConfigs.placeholder"></date-select>

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
          v-bind:layer-options="selectedLayerOption"
          v-bind:ows-url-formatter="wfs3_download_url"
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
import VarSelect from './VarSelect'
import BBOXMap from './BBOXMap'
import ProvinceSelect from './ProvinceSelect'
import StationSelect from './StationSelect'
import FormatSelectVector from './FormatSelectVector'
import DateSelect from './DateSelect'
import URLBox from './URLBox'
import InfoContactSupport from './InfoContactSupport'
import { wfs } from './mixins/wfs'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'AHCCDForm',
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
    'info-contact-support': InfoContactSupport
  },
  data () {
    return {
      wfs_layer: 'ahccd-annual',
      wfs_layer_station: 'ahccd-stations',
      date_start: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc('2017-12-31', 'YYYY-MM-DD').toDate(),
      date_min: this.$moment.utc('1840-01-01', 'YYYY-MM-DD').toDate(),
      date_max: this.$moment.utc('2017-12-31', 'YYYY-MM-DD').toDate()
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
    // Load ahccd stations
    if (this.ahccdStationsGeoJson === null) { // prevent duplicate AJAX
      var url = this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?limit=' + this.wfs_station_limit
      this.$store.dispatch('retrieveAhccdStations', url)
    }

    // reset existing selections that share with other components
    this.$store.dispatch('changeProvince', 'null') // to share with bbox
  },
  computed: {
    ahccdStationsGeoJson: function () {
      return this.$store.getters.getAhccdStations
    },
    station_props_display: function () {
      return {
        'station_name__nom_station': this.$gettext('Station name'),
        'station_id__id_station': this.$gettext('Station ID'),
        'province__province': this.$gettext('Province/Territory')
      }
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
      var selLayer = {}
      selLayer[this.wfs_layer] = this.layer_options[this.wfs_layer]
      return selLayer
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
        var format = this.dateConfigs.format
        var start = this.$moment.utc(this.date_start, format).format(format)
        var end = this.$moment.utc(this.date_end, format).format(format)
        return 'time=' + start + '/' + end
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
