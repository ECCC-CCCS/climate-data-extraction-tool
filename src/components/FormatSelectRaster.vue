<template>
  <div class="form-group">
    <label
      for="raster_download_format"
      :class="{required: required}">
      <translate>Data download format</translate>
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
    <details :open="toggleDetailsState">
      <summary @click="toggleDetails"
        v-translate>Explanation of data formats</summary>
      <ul>
        <li v-translate t-comment="contains html tags; do not translate those"><strong>GeoTIFF</strong> files can be opened, viewed and manipulated with Geographic Information System (GIS) software or scientific programming tools such as <a href="https://www.r-project.org/" target="_blank">R</a> or <a href="https://www.python.org/" target="_blank">Python</a></li>
        <li v-translate t-comment="contains html tags; do not translate those"><strong>NetCDF</strong> files can be opened, viewed and manipulated with some Geographic Information System (GIS) software or scientific programming tools such as <a href="https://www.r-project.org/" target="_blank">R</a>, <a href="https://www.python.org/" target="_blank">Python</a>, <a href="https://www.giss.nasa.gov/tools/panoply/download/" target="_blank">Panoply</a>, or <a href="https://code.mpimet.mpg.de/projects/cdo/" target="_blank">Climate Data Operators</a></li>
      </ul>
    </details>
    <select class="form-control" id="raster_download_format"
      :value="value"
      :required="required"
      @change="updateFormat">
        <option value="image/tiff">GeoTIFF</option>
        <option value="image/netcdf">NetCDF</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'FormatSelectRaster',
  props: {
    value: String,
    required: {
      type: Boolean,
      default: true
    },
    infoText: {
      type: Array,
      default: null
    }
  },
  data () {
    return {
      toggleDetailsState: false
    }
  },
  methods: {
    toggleDetails: function (event) {
      this.toggleDetailsState = !this.toggleDetailsState
    },
    updateFormat: function (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
