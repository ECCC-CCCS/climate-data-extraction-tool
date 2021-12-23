<template>
  <div
    id="url-download-box"
    class="alert mrgn-tp-md"
    :class="alertClass">
    <h2>{{ urlBoxTitle }}</h2>
    <div
      v-show="!hasErrors"
      v-for="(title, layerName) in layerOptions"
      class="mrgn-tp-sm"
      :key="layerName">
      <a
        v-show="wfs3CommonUrl === null && oapicCommonUrl === null"
        :href="owsUrlFormatter(layerName)"
        target="_blank"
        class="btn btn-default"
        :download="downloadFormat(layerName)">
        <span class="glyphicon glyphicon-download" aria-hidden="true"></span>
        <translate>Download:</translate> {{ title }}
      </a>

      <button
        id="retrieve-download-links"
        class="btn btn-primary"
        type="button"
        v-show="wfs3CommonUrl !== null"
        aria-controls="wfs3-link-list num-records-wfs3-download"
        :disabled="retrieved || loading"
        @click="getNumRecords(layerName)">
          <translate>Retrieve download links</translate>
          <pulse-loader
            :loading="loading"
            class="loading"
            :size="5"></pulse-loader>
        </button>

      <div
        id="wfs3-download-links-list"
        class="mrgn-tp-md"
        v-show="wfs3CommonUrl !== null && numRecords !== null && hasErrors === false">

        <div v-show="numRecords !== null">
          <p>
            <strong
              v-text="totalRecords"
              aria-live="polite"
              id="num-records-wfs3-download"></strong>
          </p>
          <div v-show="numRecords > 600000" class="alert alert-warning">
            <p v-html="tooManyRecordsWarning"></p>
          </div>

        </div>

        <div id="wfs3-link-list" class="list-group" aria-live="polite">
          <a
            v-for="(startIndex, index) in chunkedStartIndexes"
            v-show="numRecords !== 0"
            :key="index"
            :href="wfs3_download_url_chunk(startIndex)"
            target="_blank"
            class="list-group-item"><span class="glyphicon glyphicon-download"></span> <span v-text="wfs3_download_name_chunk(startIndex, index)"></span>
          </a>
        </div>
      </div>

      <div
        id="wcs-download-links-list"
        class="mrgn-tp-md"
        v-show="oapicCommonUrl !== null && hasErrors === false">

        <div id="wcs-link-list" class="list-group" aria-live="polite">
          <a
            v-for="(dateRange, index) in dateRangeChunks"
            :key="index"
            :href="oapicCommonUrl"
            target="_blank"
            class="list-group-item"><span class="glyphicon glyphicon-download"></span> <span v-text="dataDownloadText(dateRange, title)"></span>
          </a>
        </div>
      </div>
    </div>
    <div
      v-show="hasErrors">
      <p v-translate>Please correct all form errors to download data.</p>
    </div>
    <div
      v-show="numRecords === 0">
      <p>
        <span v-translate>Your form selection contains no data to download.</span> <span v-translate>Please change your form selection.</span>
      </p>
    </div>
  </div>
</template>

<script>
import { datasets } from './mixins/datasets'
import axios from 'axios'
import { PulseLoader } from '@saeris/vue-spinners'

export default {
  name: 'DataDownloadBox',
  mixins: [datasets],
  components: {
    PulseLoader
  },
  props: {
    layerFormat: String,
    owsUrlFormatter: {
      type: Function,
      default: function (layerName) {
        return layerName
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
    oapicCommonUrl: {
      type: String,
      default: null
    },
    dateRangeChunks: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    fileFormat: function () {
      let format = ''
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
        'alert-danger': this.hasErrors,
        'alert-warning': this.numRecords === 0
      }
    },
    totalRecords: function () {
      return this.$_i(this.$gettext('Total number of records: {numRecords}'), this)
    },
    tooManyRecordsWarning: function () {
      return this.$_i(this.$gettext('Only 600000 records can be downloaded at once. If you are looking to download more, please contact the <a href="{supportDeskUrl}" target="_blank">Climate Services Support Desk</a>.'), this)
    }
  },
  data () {
    return {
      chunkedStartIndexes: [],
      numRecords: null,
      retrieved: false,
      loading: false
    }
  },
  watch: {
    wfs3CommonUrl: function (newVal, oldVal) {
      if (newVal !== oldVal) { // reset
        this.numRecords = null
        this.chunkedStartIndexes = []
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
    getNumRecords: function () {
      let urlGetNumRecords = this.wfs3CommonUrl + '&resulttype=hits&f=json'
      this.loading = true
      axios.get(urlGetNumRecords)
        .then(response => (
          this.chunkDownload(response.data)
        ))
        .finally(() => {
          this.loading = false
          this.retrieved = true
        })
    },
    wfs3_download_url_chunk: function (startIndex) {
      startIndex = parseInt(startIndex)
      let url = this.wfs3CommonUrl
      url += '&f=' + this.fileFormat
      url += '&limit=' + this.wfs3DownloadLimit + '&startindex=' + startIndex
      return url
    },
    wfs3_download_name_chunk: function (startIndex, chunkIndex) {
      startIndex = parseInt(startIndex)
      let startNum = startIndex + 1
      let endNum = chunkIndex === (this.chunkedStartIndexes.length - 1) ? this.numRecords : this.chunkedStartIndexes[chunkIndex + 1]
      return this.$_i(this.$gettext('Download records {startNum} - {endNum}'), {'startNum': startNum, 'endNum': endNum})
    },
    dataDownloadText: function (dateRange, title) {
      let invalidDateRange = false
      let downloadText = this.$gettext('Download:') + ' '
      if (dateRange.start === null || dateRange.end === null || dateRange.start === 'Invalid date' || dateRange.end === 'Invalid date' || typeof dateRange.start === 'undefined' || typeof dateRange.end === 'undefined') {
        invalidDateRange = true
      }
      if (!invalidDateRange) {
        downloadText += this.$_i('{startDate} - {endDate}', {'startDate': dateRange.start, 'endDate': dateRange.end})
      } else if (Object.prototype.hasOwnProperty.call(dateRange, 'specialTitle')) {
        downloadText += dateRange.specialTitle
      } else { // default
        downloadText += title
      }

      return downloadText
    },
    chunkDownload: function (data) {
      this.numRecords = data.numberMatched
      this.chunkedStartIndexes = []
      let startIndex = 0
      do {
        this.chunkedStartIndexes.push(startIndex)
        startIndex += this.wfs3DownloadLimit
      } while (startIndex < this.numRecords)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.loading {
  display: inline;
}
</style>
