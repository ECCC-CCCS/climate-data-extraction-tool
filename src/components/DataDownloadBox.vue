<template>
  <div
    id="url-download-box"
    class="alert mrgn-tp-md"
    :class="alertClass">
    <h2>{{ urlBoxTitle }}</h2>
    <div
      id="oapi-download-links-list"
      class="mrgn-tp-md"
      v-show="downloadUrl !== null && !hasErrors">

      <div id="oapi-link-list" aria-live="polite">
        <a
          :href="downloadUrl"
          target="_blank"
          class="btn btn-primary">
          <span class="glyphicon glyphicon-download"></span>&nbsp;
          <span><translate>Download</translate></span>
          <span
            v-for="context in downloadContext"
            :key="context"
            >&nbsp;<span class="label label-info" v-html="context"></span>
          </span>
        </a>
      </div>
    </div>
    <div
      v-show="hasErrors">
      <p v-translate>Please correct all form errors to download data.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataDownloadBox',
  props: {
    fileFormat: String,
    fileName: {
      type: String,
      default: 'oapiDataFile'
    },
    urlBoxTitle: {
      type: String,
      default: function () {
        return this.$gettext('Data download link')
      }
    },
    hasErrors: {
      type: Boolean,
      default: false
    },
    downloadUrl: {
      type: String,
      default: null
    },
    downloadContext: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  computed: {
    fileFormatExt: function () {
      let format = ''
      switch (this.fileFormat) {
        case 'image/tiff':
          format = 'tiff'
          break
        case 'image/netcdf':
          format = 'nc'
          break
        case 'geojson':
          format = 'json'
          break
        case 'json':
          format = 'json'
          break
        case 'csv':
          format = 'csv'
          break
        case 'GRIB':
          format = 'GRIB'
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
    }
  },
  data () {
    return {
      loading: false
    }
  },
  methods: {
    downloadFormat: function (filename) {
      if (this.fileFormatExt === '') {
        return filename.replace(/\./gi, '-') // filename without extension
      } else {
        return filename + '.' + this.fileFormatExt
      }
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
