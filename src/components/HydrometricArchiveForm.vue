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
            v-translate>Dataset description</summary>
          <p v-translate>Historical hydrometric data are standardized water resource data and information. They are collected, interpreted and disseminated by the Water Survey of Canada (WSC) in partnership with the provinces, territories and other agencies through the National Hydrometric Program. These data sets include daily mean, monthly mean, annual maximum and minimum daily mean and instantaneous peak water level and discharge information for over 2700 active and 5080 discontinued hydrometric monitoring stations across Canada.</p>

          <!-- <p v-html="techDocHtml"></p> -->
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          v-bind:readable-columns="popup_props_display"
          v-bind:select-disabled="provinceSelected"
          v-bind:geojson="hydroStationsGeoJson"></bbox-map>

        <province-select
          v-model="wfs_province"></province-select>

        <station-select
          v-model="wfs_selected_station_ids"
          v-if="hydroStationsGeoJson !== null"
          v-bind:select-disabled="provinceSelected"
          v-bind:station-data="hydroStationsGeoJson.features"
          v-bind:station-prop-display="station_props_display"></station-select>

        <var-select
          class="mrgn-tp-md"
          v-model="wfs_layer"
          v-bind:label="$gettext('Value type / Time interval')"
          v-bind:required="true"
          v-bind:select-options="layer_options"></var-select>

        <fieldset>
          <legend v-translate>Date range</legend>
          <date-select
            v-model="date_start"
            v-bind:label="$gettext('Start date')"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:custom-error-msg="dateRangeErrorMessage"
            v-bind:placeholder="dateConfigs.placeholder"></date-select>

          <date-select
            v-model="date_end"
            v-bind:label="$gettext('End date')"
            v-bind:min-date="date_min"
            v-bind:max-date="date_max"
            v-bind:minimum-view="dateConfigs.minimumView"
            v-bind:format="dateConfigs.format"
            v-bind:custom-error-msg="dateRangeErrorMessage"
            v-bind:placeholder="dateConfigs.placeholder"></date-select>

          <button
            class="btn btn-default"
            type="button"
            v-on:click="clearDates">Clear dates</button>
        </fieldset>

        <format-select-vector
          class="mrgn-tp-md"
          v-model="wfs_format"></format-select-vector>

        <url-box
          v-bind:layer-options="selectedLayerOption"
          v-bind:ows-url-formatter="wfs3_download_url"
          v-bind:layer-format="wfs_format"
          v-bind:has-errors="hasErrors"
          v-bind:url-box-title="$gettext('Data download links')">
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
  name: 'HydrometricArchiveForm',
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
      wfs_layer: 'hydrometric-daily-mean',
      wfs_layer_station: 'hydrometric-stations',
      date_start: this.$moment.utc('1850-01-01', 'YYYY-MM-DD').toDate(),
      date_end: this.$moment.utc().toDate(),
      date_min: this.$moment.utc('1850-01-01', 'YYYY-MM-DD').toDate(),
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
    // Load hydrometric stations
    if (this.hydroStationsGeoJson === null) { // prevent duplicate AJAX
      var url = this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?STATUS_EN=Active&limit=' + this.wfs_station_limit
      this.$store.dispatch('retrieveHydroStations', url)
    }

    // reset existing selections that share with other components
    this.$store.dispatch('changeProvince', 'null') // to share with bbox
  },
  computed: {
    hydroStationsGeoJson: function () {
      return this.$store.getters.getHydroStations
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
      var selLayer = {}
      selLayer[this.wfs_layer] = this.layer_options[this.wfs_layer]
      return selLayer
    },
    station_props_display: function () {
      return {
        'STATION_NAME': this.$gettext('Station name'),
        'IDENTIFIER': this.$gettext('Station ID'),
        'PROV_TERR_STATE_LOC': this.$gettext('Province/Territory/State')
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
    },
    dateConfigs: function () {
      if (this.wfs_layer === 'hydrometric-monthly-mean') {
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
        var start = this.$moment.utc(this.date_start).format(this.dateConfigs.format)
        var end = this.$moment.utc(this.date_end).format(this.dateConfigs.format)
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
