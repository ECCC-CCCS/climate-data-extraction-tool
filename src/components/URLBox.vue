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
      <button
        id="retrieve-download-links"
        class="btn btn-primary"
        type="button"
        v-show="oapifCommonUrl !== null"
        aria-controls="oapif-link-list num-records-oapif-download"
        :disabled="retrieved || loading"
        @click="getNumRecords(layerName)">
          <translate>Retrieve download links</translate>
          <pulse-loader
            :loading="loading"
            class="loading"
            :size="5"></pulse-loader>
        </button>

      <div
        id="oapif-download-links-list"
        class="mrgn-tp-md"
        v-show="oapifCommonUrl !== null && numRecords !== null && hasErrors === false">

        <div v-show="numRecords !== null">
          <p>
            <strong
              v-text="totalRecords"
              aria-live="polite"
              id="num-records-oapif-download"></strong>
          </p>
          <div v-show="numRecords > 600000" class="alert alert-warning">
            <p v-html="tooManyRecordsWarning"></p>
          </div>

        </div>

        <div id="oapif-link-list" class="list-group" aria-live="polite">
          <a
            v-for="(startIndex, index) in chunkedStartIndexes"
            v-show="numRecords !== 0"
            :key="index"
            :href="oapif_download_url_chunk(startIndex)"
            target="_blank"
            class="list-group-item"><span class="glyphicon glyphicon-download"></span> <span v-text="oapif_download_name_chunk(startIndex, index)"></span>
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
  name: 'URLBox',
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
    oapiDownloadLimit: {
      type: Number,
      default: 10000
    },
    oapifCommonUrl: {
      type: String,
      default: null
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
    oapifCommonUrl: function (newVal, oldVal) {
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
      let urlGetNumRecords = this.oapifCommonUrl + '&resulttype=hits&f=json'
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
    oapif_download_url_chunk: function (startIndex) {
      startIndex = parseInt(startIndex)
      let url = this.oapifCommonUrl
      url += '&f=' + this.fileFormat
      url += '&limit=' + this.oapiDownloadLimit + '&startindex=' + startIndex
      return url
    },
    oapif_download_name_chunk: function (startIndex, chunkIndex) {
      startIndex = parseInt(startIndex)
      let startNum = startIndex + 1
      let endNum = chunkIndex === (this.chunkedStartIndexes.length - 1) ? this.numRecords : this.chunkedStartIndexes[chunkIndex + 1]
      return this.$_i(this.$gettext('Download records {startNum} - {endNum}'), {'startNum': startNum, 'endNum': endNum})
    },
    chunkDownload: function (data) {
      this.numRecords = data.numberMatched
      this.chunkedStartIndexes = []
      let startIndex = 0
      do {
        this.chunkedStartIndexes.push(startIndex)
        startIndex += this.oapiDownloadLimit
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
