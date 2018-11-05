<template>
  <div class="form-group">
    <label
      for="vector_download_format"
      v-bind:class="{required: required}">
      <translate>Data download format</translate>
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
    </label>
    <details v-bind:open="toggleDetailsState">
      <summary v-on:click="toggleDetails"
        v-translate>Explanation of data formats</summary>
      <ul>
        <li v-translate><strong>CSV</strong> files can be opened, viewed and manipulated with any word processor or spreadsheet software</li>
        <li v-translate t-comment="contains html tags; do not translate those"><strong>GeoJSON</strong> files can be opened, viewed and manipulated with Geographic Information System (GIS) software or scientific programming tools such as <a href="https://www.r-project.org/" target="_blank">R</a> or <a href="https://www.python.org/" target="_blank">Python</a></li>
      </ul>
    </details>
    <select class="form-control" id="vector_download_format"
      v-bind:value="value"
      v-bind:required="required"
      v-on:change="updateFormat">
        <option value="geojson">GeoJSON</option>
        <option value="csv">CSV</option>
    </select>
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
