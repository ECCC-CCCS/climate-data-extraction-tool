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
          v-on:click="toggleShowSelected"
          type="button"
          class="btn"
          v-bind:class="showSelected ? 'btn-primary active' : 'btn-default'"
          v-bind:disabled="selectedStationIds.length === 0"><translate t-comment="Toggle button to show selected stations in a table">Show selected</translate>
            <span v-show="selectedStationIds.length > 0">({{ selectedStationIds.length }}/{{ maxStationSelection }})</span></button>
        <button
          v-on:click="clearSelected"
          class="btn btn-danger"
          type="button"
          v-bind:disabled="selectedStationIds.length === 0"><translate t-comment="Button to clear selected stations">Clear selected</translate></button>
      </div>
      <div id="station-select-container">
        <table id="station-select-table" class="table table-striped table-hover">
          <thead>
            <tr>
              <th
                class="sortable selectable"
                title="Click to sort this column in ascending or descending order"
                v-for="(th, prop) in stationPropDisplay"
                v-bind:key="prop"
                v-on:click="sort(prop)">
                  {{ th }}
                  <span
                    v-show="currentSort === prop"
                    v-bind:class="sortIconClass"
                    class="glyphicon"></span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              class="selectable selectableStation"
              v-for="stn in paginatedStations"
              v-bind:key="stn.ID"
              v-on:click="selectStation(stn.ID)"
              v-bind:class="{
                selectedStation: (selectedStationClass(stn.ID) || selectDisabled),
                noPointerEvents: selectDisabled
              }">
              <td
                v-for="(th, prop) in stationPropDisplay"
                v-bind:key="prop">
                  {{ stn.properties[prop] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav class="form-inline">
        <button
          v-on:click="prevPage"
          class="btn btn-sm btn-default"
          v-bind:disabled="currentPage === 1"
          v-translate>Previous</button>
        <button
          v-on:click="nextPage"
          class="btn btn-sm btn-default"
          v-bind:disabled="(currentPage * pageSize) >= filteredNumEntries"
          v-translate>Next</button>
        <div class="form-group">
          <label v-translate>Page size</label>
          <select
            class="input-sm form-control"
            v-model="pageSize"
            v-on:change="currentPage = 1">
              <option value="100">100</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option v-bind:value="stationData.length" v-translate t-coment="All entries">All</option>
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
    }
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
    }
  },
  mounted: function () {
    this.clearSelected()
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
        } else if (this.selectedStationIds.includes(row.ID)) {
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
        let routeName = this.$route.name
        let datasetToStnProvColName = {
          ahccd: 'province__province',
          hydrometric: 'PROV_TERR_STATE_LOC',
          normals: 'PROV_STATE_TERR_CODE',
          daily: 'PROV_STATE_TERR_CODE',
          monthly: 'PROV_STATE_TERR_CODE'
        }
        if (datasetToStnProvColName.hasOwnProperty(routeName)) {
          let provCol = datasetToStnProvColName[routeName]
          if (row.properties[provCol].trim() === this.province) {
            return true
          } else {
            return false
          }
        } else {
          return true
        }
      } else {
        return true
      }
    },
    bboxFilter: function (row, index) {
      if (this.bbox !== null) { // bbox filter if applicable
        var stnPoint = [row.geometry.coordinates[1], row.geometry.coordinates[0]]
        return this.bounds.contains(stnPoint)
      } else {
        return true
      }
    }
  },
  computed: {
    filteredStations: function () {
      var cmp = this
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
      if (this.currentPage === 1) {
        return this.currentPage
      } else {
        return ((this.currentPage - 1) * this.pageSize) + 1
      }
    },
    lastEntryOfPage: function () {
      var maxEntryThisPage = this.currentPage * this.pageSize
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
