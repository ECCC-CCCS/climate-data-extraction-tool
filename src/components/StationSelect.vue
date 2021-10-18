<template>
  <div>
    <fieldset>
      <legend>
        <translate>Station table</translate>
        <span
          class="label label-warning"
          v-show="stationIdSelected.length === maxStationSelection"
          v-translate>Max number of stations selected</span>
      </legend>
      <div class="form-inline" aria-controls="station-select-table">
        <input
          type="text"
          class="form-control"
          placeholder="Search"
          v-model="searchText">
        <button
          id="show-selected-stations"
          @click="toggleShowSelected"
          type="button"
          class="btn btn-sm"
          :class="showSelected ? 'btn-primary active' : 'btn-default'"
          :disabled="stationIdSelected.length === 0"><translate t-comment="Toggle button to show selected stations in a table">Show selected</translate>
            <span v-show="stationIdSelected.length > 0">({{ stationIdSelected.length }}/{{ maxStationSelection }})</span></button>
        <button
          id="toggle-discontinued-stations"
          v-if="hydroStationDisplay"
          @click="toggleActiveStation"
          class="btn btn-sm"
          :class="hydroStationActive ? 'btn-warning' : 'btn-primary active'"
          type="button"
          :title="$gettext('This button will retrieve more than 7000 stations and may cause a performance loss on this graphical user interface')">
            <span v-show="hydroStationActive" class="glyphicon glyphicon-warning-sign"></span>
            <span v-show="hydroStationActive === false" class="glyphicon glyphicon-eye-open"></span>
            &nbsp;
            <span v-show="hydroStationActive"><translate>Show discontinued stations</translate></span>
            <span v-show="!hydroStationActive"><translate>Hide discontinued stations</translate></span>
            <span><pulse-loader
            :loading="isLoadingAllHydroStations"
            class="loading"
            :size="5"></pulse-loader></span>
          </button>
        <button
          id="clear-selected-stations"
          @click="clearSelected"
          class="btn btn-sm btn-danger"
          type="button"
          :disabled="stationIdSelected.length === 0"><translate t-comment="Button to clear selected stations">Clear selected</translate></button>
      </div>
      <div id="station-select-container" class="vld-parent">
        <loading :active.sync="isLoadingStations" :is-full-page="false" aria-busy="true" role="alert"></loading>
        <span v-if="isLoadingStations" class="hidden"><translate>Loading stations... please wait</translate></span>

        <table id="station-select-table" class="table table-striped table-hover" aria-live="polite">
          <thead>
            <tr>
              <th
                class="sortable selectable"
                title="Click to sort this column in ascending or descending order"
                v-for="(th, prop) in tableFieldsDisplay"
                :key="prop"
                @click="sortDir(prop)">
                  <span v-html="th"></span>
                  <span
                    v-show="currentSort === prop"
                    :class="sortIconClass"
                    class="glyphicon"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="selectable selectableStation"
              v-for="stn in paginatedStations"
              :key="stn.properties[stnPrimaryId]"
              @click="selectStation(stn.properties[stnPrimaryId])"
              :class="{
                selectedStation: (selectedStationClass(stn.properties[stnPrimaryId]) || selectDisabled),
                noPointerEvents: selectDisabled
              }">
              <td
                v-for="(th, prop) in tableFieldsDisplay"
                :key="prop">
                  <template v-if="prop === 'LATITUDE'">{{ stn.geometry.coordinates[1].toFixed(4) }}</template>
                  <template v-else-if="prop === 'LONGITUDE'">{{ stn.geometry.coordinates[0].toFixed(4) }}</template>
                  <template v-else-if="prop.match(/date/ig)">{{ dateDisplay(stn.properties[prop]) }}</template>
                  <template v-else>{{ stn.properties[prop] }}</template>
              </td>
            </tr>
            <tr
              v-show="noProvinceStationSelected && filteredNumEntries === 0"
              class="danger text-danger" role="status">
                <td
                  :colspan="numColumns">
                  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                  <translate t-comment="Warning message when user has no stations selected and no stations are contained in the map viewport">There are no stations available to download data from your current map display.</translate>
                  <span v-text="resetMapMessage"></span>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="form-inline small" aria-live="polite" aria-controls="station-select-table">
        <button
          @click="prevPage"
          class="btn btn-sm btn-default"
          :disabled="currentPage === 1"
          v-translate>Previous</button>
        <button
          @click="nextPage"
          class="btn btn-sm btn-default"
          :disabled="(currentPage * pageSize) >= filteredNumEntries"
          v-translate>Next</button>
        <div class="form-group">
          <label v-translate>Page size</label>
          <select
            class="input-sm form-control"
            v-model="pageSize"
            @change="currentPage = 1">
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option :value="totalSize" v-translate t-coment="All entries">All</option>
          </select>
        </div>
        <span>{{ showingFilterText }}</span>
      </nav>
    </fieldset>
  </div>
</template>

<script>
import { PulseLoader } from '@saeris/vue-spinners'
import Loading from 'vue-loading-overlay'
import 'vue-loading-overlay/dist/vue-loading.css'
import L from 'leaflet'
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'StationSelect',
  components: {
    PulseLoader,
    Loading
  },
  model: {
    prop: 'stationIdSelected',
    event: 'click'
  },
  props: {
    stationData: {
      type: Array,
      default: function () {
        return []
      }
    },
    stationPropDisplay: {
      type: Object,
      default: function () {
        return {}
      }
    },
    selectDisabled: {
      type: Boolean,
      default: false
    },
    noProvinceStationSelected: Boolean,
    stationProvCol: String,
    stnPrimaryId: String,
    hydroStationDisplay: {
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
  beforeMount: function () {
    this.clearSelected()

    // reset bboxStationTotal
    this.$store.dispatch('map/setBboxStationTotal', null)
  },
  data () {
    return {
      tableFieldsDisplay: this.stationPropDisplay,
      currentSort: Object.keys(this.stationPropDisplay)[0], // default to first column
      keyColumns: Object.keys(this.stationPropDisplay),
      currentSortDir: 'asc',
      pageSize: this.stationData.length, // initial as All
      currentPage: 1,
      showSelected: false,
      searchText: ''
    }
  },
  watch: {
    stationIdSelected: function (newVal) {
      if (newVal.length === 0) { // auto toggle false if no stations selected
        this.showSelected = false
      }
    },
    selectDisabled: function (newVal) {
      if (newVal) {
        this.showSelected = true
      } else {
        this.showSelected = false
      }
    },
    filteredNumEntries: function (newVal, oldVal) {
      if (newVal < oldVal) { // reset to page 1 if filtered entries become less
        this.currentPage = 1
      }
    },
    bboxStationTotal: function (newVal) {
      this.$store.dispatch('map/setBboxStationTotal', newVal)
    },
    totalSize: function (newVal) {
      this.pageSize = newVal
      this.currentPage = 1 // reset page
    }
  },
  methods: {
    sortDir: function (s) {
      // if s == current sort, reverse
      if (s === this.currentSort) {
        this.currentSortDir = this.currentSortDir === 'asc' ? 'desc' : 'asc'
      }
      this.currentSort = s
    },
    nextPage: function () {
      if ((this.currentPage * this.pageSize) < this.filteredNumEntries) {
        this.currentPage++
      }
    },
    prevPage: function () {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },
    clearSelected: function () {
      this.$store.dispatch('stations/clearStationIdSelected')
      this.$emit('click', this.stationIdSelected)
    },
    selectStation: function (selectedStnId) {
      if (this.selectDisabled) {
        return false // early exit
      }
      if (this.stationIdSelected.includes(selectedStnId)) { // remove
        this.$store.dispatch('stations/removeStationIdSelected', selectedStnId)
      } else { // add
        this.$store.dispatch('stations/addStationIdSelected', selectedStnId)
      }
      this.$emit('click', this.stationIdSelected)
    },
    selectedStationClass: function (stnId) {
      if (this.stationIdSelected.includes(stnId)) {
        return true
      } else {
        return false
      }
    },
    toggleShowSelected: function () {
      this.showSelected = !this.showSelected
    },
    toggleActiveStation: function () {
      this.$store.dispatch('stations/setHydroStationActive', !this.hydroStationActive)
    },
    isRowSelected: function (stnId) {
      if (this.showSelected) {
        if (this.stationIdSelected.length === 0 || this.stationIdSelected.includes(stnId)) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    paginateFilter: function (row, index) {
      let start = (this.currentPage - 1) * this.pageSize
      let end = this.currentPage * this.pageSize
      if (index >= start && index < end) {
        return true
      } else {
        return false
      }
    },
    selectedFilter: function (row) {
      if (this.showSelected) { // show selected is toggled on
        if (this.stationIdSelected.length === 0) {
          return true
        } else if (this.stationIdSelected.includes(row.properties[this.stnPrimaryId])) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    searchFilter: function (row) {
      if (this.searchText !== '') { // text search if applicable
        let stationText = ''
        // concatenate all properties to a single text for ease of search
        Object.keys(row.properties).forEach((key) => {
          if (!this.keyColumns.includes(key)) {
            return false
          } else if (row.properties[key] === null) {
            return false // skip null values
          } else {
            let valueText = row.properties[key] + '' // convert to string
            stationText += '^' + valueText.toLowerCase() + '$' // starts with and ends search helper; like regex
          }
        })

        if (stationText.includes(this.searchText.toLowerCase())) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    provinceFilter: function (row) {
      if (this.province !== 'null') {
        if (row.properties[this.stationProvCol].trim() === this.province) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    bboxFilter: function (row) {
      if (this.bbox !== null) { // bbox filter if applicable
        let stnPoint = [row.geometry.coordinates[1], row.geometry.coordinates[0]]
        return this.bounds.contains(stnPoint)
      } else {
        return true
      }
    },
    activeStationFilter: function (row) {
      if (this.hydroStationDisplay) {
        if (this.hydroStationActive) {
          return row.properties['STATUS_EN'] === 'Active'
        } else {
          return true
        }
      } else {
        return true
      }
    },
    dateRangeFilter: function (row) {
      // console.log('Date start: ' + this.dateStart + ' | Date end: ' + this.dateEnd + '\nrow start date: ' + row.properties[this.dateStartProp] + ' | row end date: ' + row.properties[this.dateEndProp])
      // date values use date ISOString for comparison

      // no date range filter applied
      if (this.dateStart == null || this.dateEnd == null || !this.useDateRangeFilter) {
        return true
      }

      // within range completely
      if (this.dateStart >= row.properties[this.dateStartProp] && this.dateEnd <= row.properties[this.dateEndProp]) {
        return true
      // within range of end date only
      } else if (this.dateStart < row.properties[this.dateStartProp]) {
        if (this.dateEnd >= row.properties[this.dateStartProp]) {
          return true
        } else {
          return false
        }
      // within range of start date only
      } else if (this.dateEnd > row.properties[this.dateEndProp]) {
        if (this.dateStart <= row.properties[this.dateEndProp]) {
          return true
        } else {
          return false
        }
      } else {
        return false
      }
    },
    dateDisplay: function (utcString) {
      if (utcString === null) {
        return ''
      }
      return utcString.substr(0, 10)
      // this.$moment.utc(utcString, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
    }
  },
  computed: {
    ...mapState('stations', [
      'isLoadingStations',
      'isLoadingAllHydroStations',
      'hydroStationActive',
      'stationIdSelected',
      'province',
      'maxStationSelection'
    ]),
    ...mapGetters('stations', [
      'dateStart',
      'dateEnd'
    ]),
    ...mapState('map', [
      'bbox'
    ]),
    numColumns: function () {
      return Object.keys(this.tableFieldsDisplay).length
    },
    totalSize: function () {
      return this.stationData.length
    },
    filteredStations: function () {
      let _this = this // reference to this inside sort function
      function compareStn (a, b) { // sort function
        let modifier = 1
        if (_this.currentSortDir === 'desc') {
          modifier = -1
        }
        if (a.properties[_this.currentSort] < b.properties[_this.currentSort]) {
          return -1 * modifier
        }
        if (a.properties[_this.currentSort] > b.properties[_this.currentSort]) {
          return 1 * modifier
        }
        return 0
      }

      return this.stationData
        .slice(0) // make a copy of it
        .filter(this.activeStationFilter)
        .sort(compareStn) // sort
        .filter(this.selectedFilter)
        .filter(this.bboxFilter)
        .filter(this.provinceFilter)
        .filter(this.searchFilter)
        .filter(this.dateRangeFilter)
    },
    paginatedStations: function () {
      return this.filteredStations
        .slice(0)
        .filter(this.paginateFilter)
    },
    bboxStationTotal: function () {
      return this.stationData
        .slice(0)
        .filter(this.bboxFilter).length
    },
    showingFilterText: function () {
      if (this.filteredNumEntries < this.totalSize) {
        if (this.totalSize === 1) {
          // $t: text in {} are numbers; singular case
          return this.$_i(this.$gettext('Showing {startEntryOfPage} to {lastEntryOfPage} of {filteredNumEntries} (filtered from {totalSize} total entry)'), this)
        } else { // > 1
          // $t: text in {} are numbers; plural case
          return this.$_i(this.$gettext('Showing {startEntryOfPage} to {lastEntryOfPage} of {filteredNumEntries} (filtered from {totalSize} total entries)'), this)
        }
      } else {
        // $t: text in {} are numbers
        return this.$_i(this.$gettext('Showing {startEntryOfPage} to {lastEntryOfPage} of {filteredNumEntries}'), this)
      }
    },
    filteredNumEntries: function () {
      return this.filteredStations.length
    },
    sortIconClass: function () {
      if (this.currentSortDir === 'asc') {
        return 'glyphicon-sort-by-attributes'
      } else {
        return 'glyphicon-sort-by-attributes-alt'
      }
    },
    bounds: function () {
      let bboxParts = this.bbox.split(',')
      let corner1 = L.latLng(bboxParts[1], bboxParts[0])
      let corner2 = L.latLng(bboxParts[3], bboxParts[2])
      return L.latLngBounds(corner1, corner2)
    },
    maxPages: function () {
      return Math.ceil(this.filteredNumEntries / this.pageSize)
    },
    startEntryOfPage: function () {
      if (this.filteredNumEntries === 0) {
        return 0
      } else if (this.currentPage === 1) {
        return this.currentPage
      } else {
        return ((this.currentPage - 1) * this.pageSize) + 1
      }
    },
    lastEntryOfPage: function () {
      let maxEntryThisPage = this.currentPage * this.pageSize
      if (maxEntryThisPage < this.filteredNumEntries) {
        return maxEntryThisPage
      } else {
        return this.filteredNumEntries
      }
    },
    resetMapMessage: function () {
      return this.$gettext('Please press the "Reset map" button to see the stations in this table.')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loading {
  display: inline;
}
#station-select-container {
  height: 400px;
  overflow: scroll;
}
.sortable:hover {
  background-color: #CCFFFF;
}
.selectable {
  cursor: pointer;
}
.selectableStation:hover {
  background-color: #FFFFCC;
}
.selectedStation {
  background-color: #CCFF99 !important;
}
.selectedStation:hover {
  background-color: #FFCC99 !important;
}
.noPointerEvents {
  pointer-events: none;
}
</style>
