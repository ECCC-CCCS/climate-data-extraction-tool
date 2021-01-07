<template>
  <p>
    <a
      :href="urlStationListCSV"
      target="_blank"
      download><span class="glyphicon glyphicon-download" aria-hidden="true"></span> {{downloadText}}</a>
  </p>
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
      let url = this.urlStationList
      url = url.replace('&STATUS_EN=Active', '') // hydrometric case

      // csv format
      url = url.replace('f=json', 'f=csv')
      if (!url.includes('f=csv')) {
        url += '&f=csv'
      }
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
