<template>
  <div
    id="point-download-box"
    class="alert mrgn-tp-md"
    :class="alertClass">
    <h2>{{ title }}</h2>
    <button
      type="button"
      class="btn btn-primary"
      :disabled="hasErrors || loading"
      @click="wpsDownload">
        <translate>Download</translate>
        <pulse-loader
          :loading="loading"
          class="loading"
          :size="5"></pulse-loader>
    </button>
    <div
      v-show="hasErrors">
      <p v-translate>Please correct all form errors to download data.</p>
    </div>
    <div
      v-show="downloadError">
      <p>
        <translate t-comment="WPS error message">Single grid point data could not be found.</translate> <translate t-comment="WPS error message">It's possible that your selected location is not within the dataset boundary.</translate> <translate t-comment="WPS error message">Please select a different location within the dataset boundary or change your form selection.</translate>
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import FileDownload from 'js-file-download'
import { PulseLoader } from '@saeris/vue-spinners'

export default {
  name: 'PointDownloadBox',
  components: {
    PulseLoader
  },
  props: {
    title: String,
    hasErrors: Boolean,
    pointInputs: Object
  },
  data () {
    return {
      loading: false,
      downloadError: false,
      WPS_SERVER: process.env.VUE_APP_OPENAPI_SERVER,
      WPS_RASTER_DRILL: process.env.VUE_APP_WPS_RASTER_DRILL
    }
  },
  watch: {
    pointInputs: function () {
      // reset any prior download errors
      this.downloadError = false
    }
  },
  computed: {
    caseSenFileFormat: function () {
      let format = ''
      switch (this.pointInputs.format) {
        case 'geojson':
          format = 'GeoJSON'
          break
        case 'csv':
          format = 'CSV'
          break
        default:
          format = ''
          break
      }
      return format
    },
    alertClass: function () {
      return {
        'alert-success': !this.hasErrors && !this.downloadError,
        'alert-danger': this.hasErrors || this.downloadError
      }
    },
    errorPersistsMsg: function () {
      let msg = this.$_i(this.$gettext('If this error persists, please <a href="{supportDeskUrl}">contact the Climate Services Support Desk</a>.'))
      msg = msg.replace()
      return msg
    }
  },
  methods: {
    wpsDownload: function () {
      const inputs = [
        {
          id: 'layer',
          value: this.pointInputs.layer
        }, {
          id: 'y',
          value: this.pointInputs.y
        }, {
          id: 'x',
          value: this.pointInputs.x
        }, {
          id: 'format',
          value: this.caseSenFileFormat
        }
      ]
      let rasterDrillUrl = this.WPS_SERVER + this.WPS_RASTER_DRILL
      if (this.pointInputs.format === 'csv') {
        rasterDrillUrl += '?response=raw'
      }

      this.loading = true
      this.downloadError = false
      axios.post(rasterDrillUrl, { inputs: inputs }, { timeout: 300000 })
        .then((resp) => {
          let data = resp.data
          let fileFormat = this.pointInputs.format
          if (this.pointInputs.format === 'geojson') {
            data = JSON.stringify(resp.data)
            fileFormat = 'json'
          }
          FileDownload(data, this.pointInputs.layer + '.' + fileFormat)
        }).catch((error) => {
          console.log(error)
          this.downloadError = true
        }).finally(() => {
          this.loading = false
        })
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
