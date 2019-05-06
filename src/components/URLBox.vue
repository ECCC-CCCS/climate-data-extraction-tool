<template>
  <div
    id="url_result"
    class="alert mrgn-tp-md"
    v-bind:class="alertClass">
    <h2>{{ urlBoxTitle }}</h2>
    <div
      v-show="!hasErrors"
      v-for="(title, layerName) in layerOptions"
      class="mrgn-tp-sm"
      v-bind:key="layerName">
      <a
        v-show="wfs3CommonUrl === null && wcsCommonUrl === null"
        v-bind:href="owsUrlFormatter(layerName)"
        target="_blank"
        class="btn btn-default"
        v-bind:download="downloadFormat(layerName)">
        <span class="glyphicon glyphicon-download" aria-hidden="true"></span>
        <translate>Download:</translate> {{ title }}
      </a>

      <button
        class="btn btn-primary"
        type="button"
        v-show="wfs3CommonUrl !== null"
        aria-controls="wfs3-link-list num-records-wfs3-download"
        v-bind:disabled="retrieved"
        v-on:click="getNumRecords(layerName)"><translate>Retrieve download links</translate></button>

      <div
        id="wfs3-download-links-list"
        class="mrgn-tp-md"
        v-show="wfs3CommonUrl !== null && numRecords !== null && hasErrors === false">

        <p>
          <strong
          v-show="numRecords !== null"
          v-text="totalRecords"
          aria-live="polite"
          id="num-records-wfs3-download"></strong>
        </p>

        <div id="wfs3-link-list" class="list-group" aria-live="polite">
          <a
            v-for="(offset, index) in chunkedOffsets"
            v-bind:key="index"
            v-bind:href="wfs3_download_url_chunk(offset)"
            target="_blank"
            class="list-group-item"><span class="glyphicon glyphicon-download"></span> <span v-text="wfs3_download_name_chunk(offset, index)"></span>
          </a>
        </div>
      </div>

      <div
        id="wcs-download-links-list"
        class="mrgn-tp-md"
        v-show="wcsCommonUrl !== null && hasErrors === false">

        <div id="wcs-link-list" class="list-group" aria-live="polite">
          <a
            v-for="(bandChunk, index) in wcsBandChunks"
            v-bind:key="index"
            v-bind:href="wcs_download_url_chunk(bandChunk)"
            target="_blank"
            class="list-group-item"><span class="glyphicon glyphicon-download"></span> <span v-text="wcs_download_name_chunk(bandChunk, title)"></span>
          </a>
        </div>
      </div>
    </div>
    <div
      v-show="hasErrors">
      <p v-translate>Please correct all form errors to download data.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'URLBox',
  props: {
    layerFormat: String,
    owsUrlFormatter: {
      type: Function,
      default: function (layerName) {
        return layerName
      }
    },
    bandRangeFormat: {
      type: Function,
      default: function (bandStart, bandEnd) {
        if (bandStart === null || bandEnd === null || bandStart === 'Invalid date' || bandEnd === 'Invalid date' || typeof bandStart === 'undefined' || typeof bandEnd === 'undefined') {
          return null
        } else if (bandStart === bandEnd) { // single date
          return 'B' + bandStart
        } else { // date range
          return 'B' + bandStart + ':B' + bandEnd
        }
      }
    },
    layerOptions: {
      type: Object, // allows for multiple download links of different layers
      default: function () {
        return {}
      }
    },
    urlBoxTitle: {
      type: String,
      default: 'URL'
    },
    hasErrors: {
      type: Boolean,
      default: false
    },
    wfs3DownloadLimit: {
      type: Number,
      default: 10000
    },
    wfs3CommonUrl: {
      type: String,
      default: null
    },
    wcsCommonUrl: {
      type: String,
      default: null
    },
    wcsBandChunks: {
      type: Array,
      default: function () {
        return []
      }
    },
    wcsNumBands: {
      type: Number,
      default: 0
    }
  },
  computed: {
    fileFormat: function () {
      var format = ''
      switch (this.layerFormat) {
        case 'image/tiff':
          format = 'tiff'
          break
        case 'image/netcdf':
          format = 'nc'
          break
        case 'geojson':
          format = 'json'
          break
        case 'csv':
          format = 'csv'
          break
        default:
          format = ''
          break
      }
      return format
    },
    alertClass: function () {
      return {
        'alert-success': !this.hasErrors,
        'alert-danger': this.hasErrors
      }
    },
    totalRecords: function () {
      return this.$_i(this.$gettext('Total number of records: {numRecords}'), this)
    }
  },
  data () {
    return {
      chunkedOffsets: [],
      numRecords: null,
      retrieved: false
    }
  },
  watch: {
    wfs3CommonUrl: function (newVal, oldVal) {
      if (newVal !== oldVal) { // reset
        this.numRecords = null
        this.chunkedOffsets = []
        this.retrieved = false
      }
    }
  },
  methods: {
    downloadFormat: function (filename) {
      if (this.fileFormat === '') {
        return filename.replace(/\./gi, '-') // filename without extension
      } else {
        return filename + '.' + this.fileFormat
      }
    },
    getNumRecords: function (layerName) {
      var urlGetNumRecords = this.wfs3CommonUrl + '&resulttype=hits'
      axios.get(urlGetNumRecords)
        .then(response => (
          this.chunkDownload(response.data)
        ))
      this.retrieved = true
    },
    wfs3_download_url_chunk: function (offset) {
      offset = parseInt(offset)
      var url = this.wfs3CommonUrl
      if (this.layerFormat === 'csv') {
        url += '&f=' + this.layerFormat
      }
      url += '&limit=' + this.wfs3DownloadLimit + '&offset=' + offset
      return url
    },
    wfs3_download_name_chunk: function (offset, chunkIndex) {
      offset = parseInt(offset)
      var startNum = offset + 1
      var endNum = chunkIndex === (this.chunkedOffsets.length - 1) ? this.numRecords : this.chunkedOffsets[chunkIndex + 1]
      return this.$_i(this.$gettext('Download records {startNum} - {endNum}'), {'startNum': startNum, 'endNum': endNum})
    },
    wcs_download_name_chunk: function (bandChunk, title) {
      var rangeSubset = this.bandRangeFormat(bandChunk.start, bandChunk.end)
      if (this.wcsNumBands === 0) {
        return this.$_i(this.$gettext('Download: {date}'), {'date': bandChunk.start})
      } else if (rangeSubset !== null) {
        return this.$_i(this.$gettext('Download: {startNum} - {endNum}'), {'startNum': bandChunk.start, 'endNum': bandChunk.end})
      } else if (bandChunk.hasOwnProperty('specialTitle')) {
        return this.$gettext('Download:') + ' ' + bandChunk.specialTitle
      } else { // default
        return this.$gettext('Download:') + ' ' + title
      }
    },
    wcs_download_url_chunk: function (bandChunk) {
      var rangeSubset = this.bandRangeFormat(bandChunk.start, bandChunk.end)
      var url = this.wcsCommonUrl
      if (rangeSubset !== null) {
        url += '&RANGESUBSET=' + rangeSubset
      }
      return url
    },
    chunkDownload: function (data) {
      this.numRecords = data.numberMatched
      this.chunkedOffsets = []
      var offset = 0
      do {
        this.chunkedOffsets.push(offset)
        offset += this.wfs3DownloadLimit
      } while (offset < this.numRecords)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
