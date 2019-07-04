<template>
  <div>
    <fieldset>
      <legend>
        <translate>Station table</translate>
        <span
          class="label label-warning"
          v-show="selectedStationIds.length === maxStationSelection"
          v-translate>Max number of stations selected</span>
      </legend>
      <div class="form-inline">
        <input
          type="text"
          class="form-control"
          placeholder="Search"
          v-model="searchText">
        <button
          @click="toggleShowSelected"
          type="button"
          class="btn"
          :class="showSelected ? 'btn-primary active' : 'btn-default'"
          :disabled="selectedStationIds.length === 0"><translate t-comment="Toggle button to show selected stations in a table">Show selected</translate>
            <span v-show="selectedStationIds.length > 0">({{ selectedStationIds.length }}/{{ maxStationSelection }})</span></button>
        <button
          @click="clearSelected"
          class="btn btn-danger"
          type="button"
          :disabled="selectedStationIds.length === 0"><translate t-comment="Button to clear selected stations">Clear selected</translate></button>
      </div>
      <div id="station-select-container">
        <table id="station-select-table" class="table table-striped table-hover">
          <thead>
            <tr>
              <th
                class="sortable selectable"
                title="Click to sort this column in ascending or descending order"
                v-for="(th, prop) in stationPropDisplay"
                :key="prop"
                @click="sort(prop)">
                  {{ th }}
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
                v-for="(th, prop) in stationPropDisplay"
                :key="prop">
                  <template v-if="prop === 'LATITUDE'">{{ stn.geometry.coordinates[1].toFixed(4) }}</template>
                  <template v-else-if="prop === 'LONGITUDE'">{{ stn.geometry.coordinates[0].toFixed(4) }}</template>
                  <template v-else-if="prop === 'FIRST_DATE' || prop === 'LAST_DATE'">{{ dateDisplay(stn.properties[prop]) }}</template>
                  <template v-else>{{ stn.properties[prop] }}</template>
              </td>
            </tr>
            <tr
              v-show="noProvinceStationSelected && filteredNumEntries === 0"
              class="danger text-danger">
                <td
                  :colspan="Object.keys(stationPropDisplay).length">
                  <span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span>
                  <translate t-comment="Warning message when user has no stations selected and no stations are contained in the map viewport">There are no stations available to download data from your current map display.</translate>
                  <span v-text="resetMapMessage"></span>
                </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="form-inline">
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
              <option :value="stationData.length" v-translate t-coment="All entries">All</option>
          </select>
        </div>
        <span>{{ showingFilterText }}</span>
      </nav>
    </fieldset>
  </div>
</template>

<script>
import L from 'leaflet'

export default {
  name: 'StationSelect',
  model: {
    prop: 'selectedStationIds',
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
    required: {
      type: Boolean,
      default: true
    },
    selectDisabled: {
      type: Boolean,
      default: false
    },
    noProvinceStationSelected: Boolean,
    stationProvCol: String,
    stnPrimaryId: String
  },
  mounted: function () {
    this.clearSelected()

    // reset bboxStationTotal
    this.$store.dispatch('setBboxStationTotal', null)
  },
  created: function () {
    // add lat/lon
    this.stationPropDisplay['LATITUDE'] = this.$gettext('Latitude')
    this.stationPropDisplay['LONGITUDE'] = this.$gettext('Longitude')

    // add start/end dates for certain datasets
    /*
    const allowedDatasets = ['normals', 'daily', 'monthly']
    if (allowedDatasets.indexOf(this.$route.name) !== -1) {
      this.stationPropDisplay['FIRST_DATE'] = this.$gettext('First date')
      this.stationPropDisplay['LAST_DATE'] = this.$gettext('Last date')
    }
    */
  },
  data () {
    return {
      currentSort: Object.keys(this.stationPropDisplay)[0], // default to first column
      keyColumns: Object.keys(this.stationPropDisplay),
      currentSortDir: 'asc',
      pageSize: this.stationData.length, // initial as All
      totalSize: this.stationData.length,
      currentPage: 1,
      showSelected: false,
      searchText: ''
    }
  },
  watch: {
    selectedStationIds: function (newVal, oldVal) {
      if (newVal.length === 0) { // auto toggle false if no stations selected
        this.showSelected = false
      }
    },
    selectDisabled: function (newVal, oldVal) {
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
      this.$store.dispatch('setBboxStationTotal', newVal)
    }
  },
  methods: {
    sort: function (s) {
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
    clearSelected: function (evt) {
      this.$store.dispatch('clearStationIdSelected')
      this.$emit('click', this.selectedStationIds)
    },
    selectStation: function (selectedStnId) {
      if (this.selectDisabled) {
        return false // early exit
      }
      if (this.selectedStationIds.includes(selectedStnId)) { // remove
        this.$store.dispatch('removeStationIdSelected', selectedStnId)
      } else { // add
        this.$store.dispatch('addStationIdSelected', selectedStnId)
      }
      this.$emit('click', this.selectedStationIds)
    },
    selectedStationClass: function (stnId) {
      if (this.selectedStationIds.includes(stnId)) {
        return true
      } else {
        return false
      }
    },
    toggleShowSelected: function (evt) {
      this.showSelected = !this.showSelected
    },
    isRowSelected: function (stnId) {
      if (this.showSelected) {
        if (this.selectedStationIds.length === 0 || this.selectedStationIds.includes(stnId)) {
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
    selectedFilter: function (row, index) {
      if (this.showSelected) { // show selected is toggled on
        if (this.selectedStationIds.length === 0) {
          return true
        } else if (this.selectedStationIds.includes(row.properties[this.stnPrimaryId])) {
          return true
        } else {
          return false
        }
      } else {
        return true
      }
    },
    searchFilter: function (row, index) {
      if (this.searchText !== '') { // text search if applicable
        let stationText = ''
        // concatenate all properties to a single text for ease of search
        Object.keys(row.properties).forEach((key, propIndex) => {
          if (!this.keyColumns.includes(key)) {
            return false
          } else if (row.properties[key] === null) {
            return false // skip null values
          } else {
            var valueText = row.properties[key] + '' // convert to string
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
    provinceFilter: function (row, index) {
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
    bboxFilter: function (row, index) {
      if (this.bbox !== null) { // bbox filter if applicable
        let stnPoint = [row.geometry.coordinates[1], row.geometry.coordinates[0]]
        return this.bounds.contains(stnPoint)
      } else {
        return true
      }
    },
    dateDisplay: function (utcString) {
      return utcString.substr(0, 10)
      // this.$moment.utc(utcString, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD')
    }
  },
  computed: {
    filteredStations: function () {
      let cmp = this
      function compareStn (a, b) {
        let modifier = 1
        if (cmp.currentSortDir === 'desc') {
          modifier = -1
        }
        if (a.properties[cmp.currentSort] < b.properties[cmp.currentSort]) {
          return -1 * modifier
        }
        if (a.properties[cmp.currentSort] > b.properties[cmp.currentSort]) {
          return 1 * modifier
        }
        return 0
      }

      return this.stationData
        .slice(0) // make a copy of it
        .sort(compareStn) // sort
        .filter(this.selectedFilter)
        .filter(this.bboxFilter)
        .filter(this.provinceFilter)
        .filter(this.searchFilter)
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
    selectedStationIds: function () {
      return this.$store.getters.getStationIdSelected
    },
    bbox: function () {
      return this.$store.getters.getBBOX
    },
    pixelBounds: function () {
      return this.$store.getters.getPixelBounds
    },
    bboxMap: function () {
      return this.$store.getters.getMap
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
    // {{ currentPage }} to {{ maxPages*pageSize }}
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
    province: function () {
      return this.$store.getters.getProvince
    },
    maxStationSelection: function () {
      return this.$store.getters.getMaxStationSelection
    },
    resetMapMessage: function () {
      return this.$gettext('Please press the "Reset map" button to see the stations in this table.')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
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
