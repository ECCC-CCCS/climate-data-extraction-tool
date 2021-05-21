<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <p>{{ introDatasetText.station.instructions }}</p>

        <div class="alert alert-info">
          <p v-html="htmlNoteMoreData"></p>
        </div>

        <p>
          <strong>{{ introDatasetText.station.tipTitle }}</strong>
          <ul>
            <li
              v-for="(pointText, index) in introDatasetText.station.tipPoints"
              :key="index">{{ pointText }}</li>
          </ul>
        </p>

        <data-access-doc-link></data-access-doc-link>

        <details :open="toggleDetailsState">
          <summary @click="toggleDetails"
            v-translate>Dataset description, technical information and metadata</summary>
          <p v-translate>Monthly climate summaries are cross-country summaries of the averages and extremes for the month, including precipitation totals, max-min temperatures, and degree days. These data are available from stations that produce daily data.</p>

          <p v-html="techDocHtml"></p>

          <p v-html="openPortalHtml"></p>

          <station-list-link
            :url-station-list="urlStationList"
            :download-text="$gettext('Download a list of detailed information for each Monthly climate summaries station.')"></station-list-link>
        </details>

        <info-contact-support></info-contact-support>

        <bbox-map
          v-model="ows_bbox"
          :max-zoom="mapMaxZoom"
          :readable-columns="popup_props_display"
          :select-disabled="provinceSelected"
          :geojson="climateStationsGeoJson"
          :stn-primary-id="stnPrimaryId"></bbox-map>

        <province-select
          v-model="wfs_province"></province-select>

        <station-select
          v-model="wfs_selected_station_ids"
          :select-disabled="provinceSelected"
          :station-data="climateStationsGeoJson.features"
          :station-prop-display="station_props_display"
          :station-prov-col="stationProvCol"
          :no-province-station-selected="noProvinceStationSelected"
          :stn-primary-id="stnPrimaryId"></station-select>

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
  name: 'ClimateMonthlyForm',
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
      wfs_layer: 'climate-monthly',
      wfs_layer_station: 'climate-stations',
      date_start: this.$moment.utc('1908-02-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      date_end: this.$moment.utc().toDate(),
      date_min: this.$moment.utc('1908-02-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
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
      this.$store.dispatch('retrieveClimateMonthlyStations', this.urlStationMapList)
    }

    // Get min local_date dynamically to set date_min
    let minDate = this.$store.getters.getClimateMonthlyMinDate
    if (minDate === null) { // prevent duplicate AJAX
      let thisComp = this // for reference in axios response; "this" reserved in axios

      axios.get(this.urlDatasetMinDate)
        .then(function (response) {
          if (Object.prototype.hasOwnProperty.call(response.data, 'features')) {
            minDate = response.data.features[0].properties.LOCAL_DATE
            thisComp.$store.dispatch('setClimateMonthlyMinDate', minDate)
            thisComp.date_start = thisComp.$moment.utc(minDate, 'YYYY-MM').toDate()
            thisComp.date_min = thisComp.$moment.utc(minDate, 'YYYY-MM').toDate()
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
    climateStationsGeoJson: function () {
      return this.$store.getters.getClimateMonthlyStations
    },
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Climate ID')
      props['PROV_STATE_TERR_CODE'] = this.$gettext('Province / Territory / State')
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
