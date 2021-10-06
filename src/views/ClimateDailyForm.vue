<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <p>{{ introDatasetText.station.instructions }}</p>

        <div class="alert alert-info">
          <p v-html="htmlNoteMoreData"></p>
        </div>

        <details>
          <summary>{{ introDatasetText.station.tipTitle }}</summary>
          <ul>
            <li
              v-for="(pointText, index) in introDatasetText.station.tipPoints"
              :key="index">{{ pointText }}</li>
          </ul>
        </details>

        <data-access-doc-link></data-access-doc-link>

        <details>
          <summary v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>Daily climate data is derived from two sources of data; Daily Climate Stations producing one or two observations per day of temperature, precipitation, and hourly stations (see hourly data sets) that typically produce more weather elements e.g. wind or snow on ground.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>

          <station-list-link
            :url-station-list="urlStationList"
            :download-text="$gettext('Download a list of detailed information for each Daily climate station.')"></station-list-link>
        </details>

        <details open>
          <summary v-translate>Map filters</summary>

          <province-select
            v-model="wfs_province"></province-select>

          <fieldset>
            <legend v-translate>Date range</legend>
            <div class="row">
              <div class="col-sm-6">
                <date-select
                  v-model="date_start"
                  :label="$gettext('Start date')"
                  :placeholder="$gettext('YYYY-MM-DD')"
                  :minimum-view="dateConfigs.minimumView"
                  :format="dateConfigs.format"
                  :min-date="date_min"
                  :max-date="date_max"
                  :custom-error-msg="dateRangeErrorMessage"></date-select>
              </div>

              <div class="col-sm-6">
                <date-select
                  v-model="date_end"
                  :label="$gettext('End date')"
                  :placeholder="$gettext('YYYY-MM-DD')"
                  :minimum-view="dateConfigs.minimumView"
                  :format="dateConfigs.format"
                  :min-date="date_min"
                  :max-date="date_max"
                  :custom-error-msg="dateRangeErrorMessage"></date-select>
              </div>
            </div>

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
          :geojson="climateStationsGeoJson"
          :stn-primary-id="stnPrimaryId"></bbox-map>

        <station-select
          v-model="wfs_selected_station_ids"
          :select-disabled="provinceSelected"
          :station-data="climateStationsGeoJson.features"
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

        <info-contact-support></info-contact-support>
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from '@/components/DatasetMenu'
import BBOXMap from '@/components/BBOXMap'
import ProvinceSelect from '@/components/ProvinceSelect'
import StationSelect from '@/components/StationSelect'
import FormatSelectVector from '@/components/FormatSelectVector'
import DateSelect from '@/components/DateSelect'
import URLBox from '@/components/URLBox'
import InfoContactSupport from '@/components/InfoContactSupport'
import StationListLink from '@/components/StationListLink'
import DataAccessDocLink from '@/components/DataAccessDocLink'
import { wfs } from '@/components/mixins/wfs'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'
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
    'station-list-link': StationListLink,
    DataAccessDocLink
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
    wfs_province: function (newVal) {
      this.$store.dispatch('changeProvince', newVal) // to share with bbox
    },
    ows_bbox: function (newVal) {
      this.$store.dispatch('changeBBOX', newVal) // to share with station select table
    }
  },
  beforeMount () {
    // Load climate stations
    if (this.climateStationsGeoJson.features.length === 0) { // prevent duplicate AJAX
      this.$store.dispatch('retrieveClimateNormalsStations', this.urlStationMapList)
    }

    // Get min local_date dynamically to set date_min
    let minDate = this.$store.getters.getClimateNormalsMinDate
    if (minDate === null) { // prevent duplicate AJAX
      let thisComp = this // for reference in axios response; "this" reserved in axios

      axios.get(this.urlDatasetMinDate)
        .then(function (response) {
          if (Object.prototype.hasOwnProperty.call(response.data, 'features')) {
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
  },
  computed: {
    urlStationList: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer_station + '/items?f=json&limit=' + this.wfs_station_limit
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.datasetToStnColName[this.$route.name]},DLY_FIRST_DATE,DLY_LAST_DATE`
    },
    urlDatasetMinDate: function () {
      return this.wfs3_url_base + '/' + this.wfs_layer + '/items?f=json&sortby=LOCAL_DATE&limit=1'
    },
    climateStationsGeoJson: function () {
      return this.$store.getters.getClimateNormalsStations
    },
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
        en: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_EN + '/historical_data/search_historic_data_e.html',
        fr: process.env.VUE_APP_CLIMATE_HISTORICAL_SERVER_FR + '/historical_data/search_historic_data_f.html'
      }
      const website = `<a href="${url[this.$i18n.activeLocale]}" target="_blank">` + this.$pgettext('a phrase that is mid sentence', 'Government of Canada Historical Climate Data website') + '</a>'
      return this.$_i(this.$gettext('Hourly data for some stations and variables can be found on the {website}.'), {website: website})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
