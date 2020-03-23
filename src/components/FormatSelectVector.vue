<template>
  <div class="form-group">
    <label
      for="vector_download_format"
      :class="{required: required}">
      <translate>Data download format</translate>
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
    </label>
    <select class="form-control" id="vector_download_format" aria-controls="vectorFormatDescriptions"
      :value="value"
      :required="required"
      @change="updateFormat">
        <option
          v-for="(format, key) in formats"
          :key="key"
          :value="key">
          {{ format }}
        </option>
    </select>

    <div id="vectorFormatDescriptions" class="alert alert-info mrgn-tp-md" aria-live="polite" role="region">
      <p>
        <span v-html="formatDescriptionsHtml[value]"></span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormatSelectVector',
  props: {
    value: String,
    required: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      formats: {
        'csv': 'CSV',
        'geojson': 'GeoJSON'
      },
      linkTo: {
        r: '<a href="https://www.r-project.org/" class="alert-link" target="_blank">R</a>',
        python: '<a href="https://www.python.org/" class="alert-link" target="_blank">Python</a>'
      }
    }
  },
  computed: {
    formatDescriptionsHtml: function () {
      return {
        'csv': this.$_i(this.$gettext('{formatName} files can be opened, viewed and manipulated with any word processor or spreadsheet software.'), {
          formatName: '<strong>CSV</strong>'
        }),
        'geojson': this.$_i(this.$gettext('{formatName} files can be opened, viewed and manipulated with Geographic Information System (GIS) software or scientific programming tools such as {linkToR} or {linkToPython}.'), {
          formatName: '<strong>GeoJSON</strong>',
          linkToR: this.linkTo.r,
          linkToPython: this.linkTo.python
        })
      }
    }
  },
  methods: {
    updateFormat: function (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
