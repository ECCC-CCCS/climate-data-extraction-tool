<template>
  <div
    id="url-download-box"
    class="alert mrgn-tp-md"
    :class="alertClass"
    aria-live="polite">
    <h2>{{ urlBoxTitle }}</h2>
    <div
      id="oapi-download-links-list"
      class="mrgn-tp-md list-group"
      v-show="downloadUrl !== null && !hasErrors">

      <a
        :href="downloadUrl"
        id="download-url"
        target="_blank"
        class="downloadUrl list-group-item">
        <span class="glyphicon glyphicon-download"></span> Download<br>
        <span
          v-for="context in downloadContext"
          :key="context"
          ><span class="label label-info" v-text="context"></span>&nbsp;
        </span>
      </a>
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
a.downloadUrl {
  text-decoration-line: none;
  overflow-wrap: break-word;
}
</style>
