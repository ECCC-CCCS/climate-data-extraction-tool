<template>
  <div>
  <p>
    <a
      v-bind:href="urlStationListCSV"
      target="_blank"
      download><span class="glyphicon glyphicon-download" aria-hidden="true"></span> <translate>Download station list for this dataset.</translate></a>
  </p>
  </div>
</template>

<script>
export default {
  name: 'StationlistLink',
  props: {
    urlStationList: String
  },
  computed: {
    urlStationListCSV: function () {
      return this.urlStationList + '&f=csv'
    }
  }
}
</script>

<style>
</style>
