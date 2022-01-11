<template>
  <div class="form-group">
    <label
      for="file_download_format"
      :class="{required: required}">
      <translate>Data download format</translate>&nbsp;
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
      <span v-if="infoText !== null">
        <br>
        <div v-for="(info, index) in infoText" :key="index">
          <span class="small bg-info text-info">
          <span class="glyphicon glyphicon-info-sign"></span>
            <span v-html="$_i(info.text, {link: info.link[$i18n.activeLocale]})"></span>
          </span>
        </div>
      </span>
    </label>
    <select class="form-control" id="file_download_format" aria-controls="fileFormatDescriptions"
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

    <div id="fileFormatDescriptions" class="alert alert-info mrgn-tp-md" aria-live="polite" role="region"
      v-if="Object.prototype.hasOwnProperty.call(formatDescriptionsHtml, value)">
      <p>
        <span v-html="formatDescriptionsHtml[value]"></span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FormatSelectFile',
  props: {
    value: String,
    required: {
      type: Boolean,
      default: true
    },
    infoText: {
      type: Array,
      default: null
    },
    formats: {
      type: Object,
      default: () => {
        return {
          'NetCDF': 'NetCDF'
        }
      }
    }
  },
  data () {
    return {
      linkTo: {
        r: '<a href="https://www.r-project.org/" class="alert-link" target="_blank">R</a>',
        python: '<a href="https://www.python.org/" class="alert-link" target="_blank">Python</a>',
        panoply: '<a href="https://www.giss.nasa.gov/tools/panoply/download/" class="alert-link" target="_blank">Panoply</a>',
        cdo: '<a href="https://code.mpimet.mpg.de/projects/cdo/" class="alert-link" target="_blank">Climate Data Operators</a>'
      }
    }
  },
  computed: {
    formatDescriptionsHtml: function () {
      return {
        'image/tiff': this.$_i(this.$gettext('{formatName} files can be opened, viewed and manipulated with Geographic Information System (GIS) software or scientific programming tools such as {linkToR} or {linkToPython}.'), {
          formatName: '<strong>GeoTIFF</strong>',
          linkToR: this.linkTo.r,
          linkToPython: this.linkTo.python
        }),
        'NetCDF': this.$_i(this.$gettext('{formatName} files can be opened, viewed and manipulated with some Geographic Information System (GIS) software or scientific programming tools such as {linkToR}, {linkToPython}, {linkToPanoply}, or {linkToCDO}.'), {
          formatName: '<strong>NetCDF</strong>',
          linkToR: this.linkTo.r,
          linkToPython: this.linkTo.python,
          linkToPanoply: this.linkTo.panoply,
          linkToCDO: this.linkTo.cdo
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
