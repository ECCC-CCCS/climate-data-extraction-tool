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
        v-bind:href="owsUrlFormatter(layerName)"
        target="_blank"
        class="btn btn-default"
        v-bind:download="downloadFormat(layerName)">
        <span class="glyphicon glyphicon-download" aria-hidden="true"></span>
        <translate>Download:</translate> {{ title }}
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
  name: 'URLBox',
  props: {
    layerFormat: String,
    owsUrlFormatter: {
      type: Function,
      default: function (layerName) {
        return layerName
      }
    },
    layerOptions: {
      type: Object,
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
    }
  },
  methods: {
    downloadFormat: function (filename) {
      if (this.fileFormat === '') {
        return filename.replace(/\./gi, '-') // filename without extension
      } else {
        return filename + '.' + this.fileFormat
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
