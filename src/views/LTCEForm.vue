<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>

    <p v-html="ltceIntroBlurbHtml"></p>

    <div class="alert alert-warning">
      <p><span v-translate>These data should not be used to answer questions about climate change. For climate change or trend detection the data would have to be adjusted to remove such artifacts as discontinuities and non-climate trends.</span> <span v-html="htmlReferAHCCD"></span></p>
    </div>

    <tips-using-tool></tips-using-tool>

    <details>
      <summary v-translate>Technical information and metadata</summary>

      <p v-translate>Anomalous weather resulting in Temperature and Precipitation extremes occurs almost every day somewhere in Canada. For the purpose of identifying and tabulating daily extremes of record for temperature, precipitation and snowfall, the Meteorological Service of Canada has threaded or put together data from closely related stations to compile a long time series of data for about 750 locations in Canada to monitor for record-breaking weather.</p>

      <p>
        <span v-translate>This data provides:</span>
        <ol>
          <li v-translate>The daily extremes of record for temperature for each day of the year. Daily elements include: high maximum, low maximum, high minimum, low minimum.</li>
          <li v-translate>The daily extremes of record for precipitation for each day of the year. Daily elements include: greatest precipitation.</li>
          <li v-translate>The daily extremes of record for snowfall for each day of the year. Daily elements include: greatest snowfall.</li>
        </ol>
      </p>

      <p v-html="virtualClimateStnDescHtml"></p>

      <p v-html="techDocHtml"></p>

      <open-portal-links
        :open-portal-list-html="openPortalListHtml"
        :open-portal-variables="datasetTitles[$route.name].openPortal.variables"></open-portal-links>

      <strong v-translate>Virtual climate station list download:</strong>
      <ul>
        <li><station-list-link
          :url-station-list="urlStationList + '&limit=' + oapif_station_limit"
          :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station')"></station-list-link></li>
        <li><station-list-link
          :url-station-list="urlStationListElements.temperature + '&limit=' + oapif_station_limit"
          :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with temperature record type only')"></station-list-link></li>
        <li><station-list-link
          :url-station-list="urlStationListElements.precipitation + '&limit=' + oapif_station_limit"
          :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with precipitation record type only')"></station-list-link></li>
        <li><station-list-link
          :url-station-list="urlStationListElements.snowfall + '&limit=' + oapif_station_limit"
          :download-text="$gettext('Download a list of detailed information for each LTCE virtual climate station with snowfall record type only')"></station-list-link></li>
      </ul>
    </details>

    <data-access-doc-link></data-access-doc-link>

    <details open>
      <summary id="map-filters-header" v-translate>Map filters</summary>

      <var-select
        class="mrgn-tp-md"
        v-model="oapif_layer"
        :label="$gettext('Climate element / record type')"
        :required="true"
        :select-options="layer_options"></var-select>

      <province-select
        v-model="oapif_province"></province-select>
    </details>

    <bbox-map
      v-model="mapBBOX"
      :max-zoom="18"
      :readable-columns="popup_props_display"
      :geojson="ltceStationGeoJson"
      :stn-primary-id="stnPrimaryId"></bbox-map>

    <station-select
      v-model="oapif_selected_station_ids"
      :station-data="ltceStationGeoJson.features"
      :station-prop-display="station_props_display"
      :station-prov-col="stationProvCol"
      :no-province-station-selected="noProvinceStationSelected"
      :stn-primary-id="stnPrimaryId"></station-select>

    <div class="row mrgn-tp-md">
      <div id="local-month-selection" class="form-group col-md-3 col-sm-4 col-xs-6">
        <label
          for="var-sel-local_month" v-translate>Month</label>
        <select
          class="form-control"
          id="var-sel-local_month"
          aria-controls="local-day-selection"
          v-model="local_month">
            <option v-for="(option, index) in sortedMonthOptions" :key="index" :value="option.val">{{ option.text }}</option>
        </select>
      </div>

      <div id="local-day-selection" class="form-group col-md-9 col-sm-8 col-xs-6">
        <label
          for="var-sel-local_day" v-translate>Day</label>
        <select
          class="form-control"
          id="var-sel-local_day"
          aria-live="polite"
          v-model="local_day">
            <option v-for="(option, index) in sortedDayOptions" :key="index" :value="option.val">{{ option.text }}</option>
        </select>
      </div>
    </div>

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
import URLBox from '@/components/URLBox.vue'
import StationListLink from '@/components/StationListLink.vue'
import OpenPortalLinks from '@/components/OpenPortalLinks.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import MoreResources from '@/components/MoreResources.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import datasetPaths from '@/static/datasetPaths.js'
import { oapif } from '@/components/mixins/oapi-features.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'LTCEForm',
  mixins: [oapif, ows, datasets],
  components: {
    VarSelect,
    'bbox-map': BBOXMap,
    ProvinceSelect,
    StationSelect,
    FormatSelectVector,
    'url-box': URLBox,
    StationListLink,
    OpenPortalLinks,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources,
  },
  data () {
    return {
      oapif_layer: 'ltce-temperature',
      oapif_layer_station: 'ltce-stations',
      oapif_station_limit: 30000,
      date_start: this.$moment.utc(new Date()).toDate(), // date_start for ease of integrating with error checks
      date_min: this.$moment.utc(new Date()).subtract(1, 'years').toDate(),
      date_max: this.$moment.utc(new Date()).toDate(),
      ltceLayerToElementKey: {
        'ltce-temperature': 'TEMPERATURE',
        'ltce-precipitation': 'PRECIPITATION',
        'ltce-snowfall': 'SNOWFALL'
      },
      local_day: this.$moment.utc(new Date()).format('DD'), // today's date
      local_month: this.$moment.utc(new Date()).format('MM') // today's month
    }
  },
  watch: {
    oapif_province: function (newVal) {
      this.$store.dispatch('stations/changeProvince', newVal) // to share with bbox
    },
    oapif_layer: function () {
      // different layer has different stations
      this.$store.dispatch('stations/clearStationIdSelected') // clear existing selection
      this.$store.dispatch('stations/retrieveLtceStations', {url: this.urlStationMapList, uniqueCol: this.stnPrimaryId})
    },
    mapBBOX: function (newVal) {
      this.$store.dispatch('map/changeBBOX', newVal) // to share with station select table
    },
    activeLocale3: function (newLang3) {
      this.datasetToNameColName.ltce = `VIRTUAL_STATION_NAME_${newLang3[0]}`
    },
    local_month: function (newMonth) {
      const maxDays = this.daysOfMonth[newMonth]
      if (this.local_day !== 'all' && parseInt(this.local_day) > maxDays) { // ensure day selection correspeonds with the month selection
        this.local_day = maxDays // auto set to max day
      }
    }
  },
  beforeMount () {
    // Load LTCE stations
    if (this.numStationLtce === 0) { // prevent duplicate AJAX
      this.$store.dispatch('stations/retrieveLtceStations', {
        url: this.urlStationMapList,
        uniqueCol: this.stnPrimaryId
      })
    }
  },
  computed: {
    urlStationList: function () {
      return this.oapif_url_base + '/' + this.oapif_layer_station + '/items?f=json'
    },
    urlStationListElements: function () {
      return {
        temperature: this.urlStationList + '&ELEMENT_NAME_E=TEMPERATURE',
        precipitation: this.urlStationList + '&ELEMENT_NAME_E=PRECIPITATION',
        snowfall: this.urlStationList + '&ELEMENT_NAME_E=SNOWFALL'
      }
    },
    urlStationMapList: function () {
      return this.urlStationList + `&properties=${this.stationProvCol},${this.datasetToNameColName[this.$route.name]},${this.stnPrimaryId},ELEMENT_NAME_E&ELEMENT_NAME_E=${this.ltceLayerToElementKey[this.oapif_layer]}`
    },
    ...mapState('stations', [
      'ltceStationGeoJson'
    ]),
    ...mapGetters('stations', [
      'numStationLtce'
    ]),
    station_props_display: function () {
      let props = {}
      props[this.datasetToNameColName[this.$route.name]] = this.$gettext('Virtual station name')
      props[this.datasetToStnColName[this.$route.name]] = this.$gettext('Virtual station ID')
      props[this.datasetToProvColName[this.$route.name]] = this.$gettext('Province') + '&nbsp/<br>' + this.$gettext('Territory')
      props['ELEMENT_NAME_E'] = this.$gettext('Element name')
      props['LATITUDE'] = this.$gettext('Latitude')
      props['LONGITUDE'] = this.$gettext('Longitude')
      return props
    },
    layer_options: function () {
      return {
        'ltce-temperature': this.$gettext('Temperature - Daily extremes of record'),
        'ltce-precipitation': this.$gettext('Precipitation - Daily extremes of record'),
        'ltce-snowfall': this.$gettext('Snowfall - Daily extremes of record')
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
        }
      }
    },
    dateConfigs: function () {
      return {
        minimumView: 'day',
        maximumView: 'day',
        format: 'YYYY-MM-DD',
        placeholder: 'MM-DD'
      }
    },
    hasErrors: function () {
      return this.dateStartIsEmptyOnly
    },
    hasInvalidMomentDate: function () {
      let format = this.dateConfigs.format
      let start = this.$moment.utc(this.date_start, format).format(format)

      return (start === 'Invalid date')
    },
    dateRangeHasNull: function () {
      return this.dateStartEmpty
    },
    temporal: function () {
      if (this.dateRangeIsValid) {
        let dateQuery = []
        if (this.local_month !== 'all') {
          dateQuery.push('LOCAL_MONTH=' + this.local_month)
        }
        if (this.local_day !== 'all') {
          dateQuery.push('LOCAL_DAY=' + this.local_day)
        }
        return dateQuery.length >= 1 ? dateQuery.join('&') : dateQuery.join('')
      } else {
        return null
      }
    },
    virtualClimateStnDescHtml: function () {
      let weatherOfficeLink = (this.activeLocale === 'fr') ? '<a href="https://meteo.gc.ca/" target="_blank">meteo.gc.ca</a>' : '<a href="https://weather.gc.ca/" target="_blank">weather.gc.ca</a>'

      return this.$_i(this.$gettext('Virtual Climate stations correspond with the city pages of {weatherOfficeLink}. A Virtual Climate station is the result of threading together climate data from proximate current and historical stations to construct a long term threaded data set. The length of the time series of virtual stations is often greater than 100 years. A Virtual Climate station is always named for an "Area" rather than a point, e.g. Winnipeg Area, to indicate that the data are drawn from that area(within a 20km radius from the urban center) rather than a single precise location.'), { weatherOfficeLink: weatherOfficeLink })
    },
    seeFAQLinkHtml: function () {
      let faqHref = 'https://www.canada.ca/en/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/frequently-asked-questions-long-term-climate-extremes.html'
      if (this.activeLocale === 'fr') {
        faqHref = 'https://www.canada.ca/fr/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/foire-questions-extremes-climatiques-long-terme.html'
      }
      return `<a href="${faqHref}" target="_blank" title="` + this.$gettext('Frequently asked questions about LTCE') + '">' + this.$gettext('see FAQ') + '</a>'
    },
    ltceIntroBlurbHtml: function () {
      return this.$_i(this.$gettext('The daily climate records database, also known as Long Term Climate Extremes (LTCE; {seeFAQLink}), was developed to address the fragmentation of climate information due to station changes (opening, closing, relocation, etc.) over time. For approximately 750 locations in Canada, &quot;virtual&quot; climate stations have been developed by joining (threading) climate data for an urban location, from nearby stations to make long-term records. Each long-term record consists of the extremes (record values) of daily maximum/minimum temperatures, total precipitation and snowfall for each day of the year. Many of the longest data sets of extremes date as far back as the 1800s. This dataset identifies, for example, the highest temperature or the greatest snowfall on record for each day of the year for the selected urban area.'), { seeFAQLink: this.seeFAQLinkHtml})
    },
    daysOfMonth: function () {
      return {
        'all': 31,
        '01': 31,
        '02': 29,
        '03': 31,
        '04': 30,
        '05': 31,
        '06': 30,
        '07': 31,
        '08': 31,
        '09': 30,
        '10': 31,
        '11': 30,
        '12': 31
      }
    },
    monthOptions: function () {
      return {
        '01': this.$gettext('01 - January'),
        '02': this.$gettext('02 - February'),
        '03': this.$gettext('03 - March'),
        '04': this.$gettext('04 - April'),
        '05': this.$gettext('05 - May'),
        '06': this.$gettext('06 - June'),
        '07': this.$gettext('07 - July'),
        '08': this.$gettext('08 - August'),
        '09': this.$gettext('09 - September'),
        '10': this.$gettext('10 - October'),
        '11': this.$gettext('11 - November'),
        '12': this.$gettext('12 - December'),
        'all': this.$gettext('All months')
      }
    },
    sortedMonthOptions: function () {
      let keys = Object.keys(this.monthOptions).sort()
      let sorted = []
      keys.forEach((key) => {
        sorted.push({val: key, text: this.monthOptions[key]})
      })
      return sorted
    },
    sortedDayOptions: function () {
      let days = []
      const maxDay = this.daysOfMonth[this.local_month]
      const maxDays = (this.local_month !== 'all') ? maxDay : '366'
      let textMax = (this.local_month !== 'all') ? this.$gettext('All {maxDays} days of the month') : this.$gettext('All {maxDays} days of the year')
      for (let i = 1; i <= maxDay; i++) {
        let dd = i
        if (i < 10) {
          dd = '0' + i // pad with 0
        }
        dd += ''  // ensure string
        days.push({val: dd, text: dd})
      }
      days.push({val: 'all', text: this.$_i(textMax, {maxDays: maxDays})})
      return days
    },
    htmlReferAHCCD: function () {
      const ahccdPath = datasetPaths.ahccd[this.$i18n.activeLocale]
      return this.$_i(this.$gettext('Please refer to the <a href="#{ahccdPath}">Adjusted and Homogenized Canadian Climate Data (AHCCD)</a> for climate change purposes.'), {ahccdPath: ahccdPath})
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
