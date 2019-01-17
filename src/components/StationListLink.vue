<template>
  <div>
  <p>
    <a
      v-bind:href="urlStationListCSV"
      target="_blank"
      download><span class="glyphicon glyphicon-download" aria-hidden="true"></span> {{downloadText}}</a>
  </p>
  </div>
</template>

<script>
export default {
  name: 'StationlistLink',
  props: {
    urlStationList: String,
    downloadText: String
  },
  computed: {
    urlStationListCSV: function () {
      var url = this.urlStationList
      url = url.replace('STATUS_EN=Active', '') // hydrometric case
      url += '&f=csv'
      return url
    },
    defaultDownloadText: function () {
      return this.$gettext('Download station list for this dataset.')
    }
  }
}
</script>

<style>
</style>
