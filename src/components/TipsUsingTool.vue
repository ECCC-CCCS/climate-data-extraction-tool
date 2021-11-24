<template>
  <details>
    <summary v-translate>Tips for using the tool</summary>
    <div v-if="griddedRouteNames.includes($route.name)">
      <p v-text="textTipUsingToolGridded.use"></p>
      <p v-text="textTipUsingToolGridded.instructions"></p>
    </div>
    <ul v-else>
      <li
        v-for="(pointText, index) in textTipUsingToolStation.tipPoints"
        :key="index">{{ pointText }}</li>
    </ul>
  </details>
</template>

<script>
export default {
  name: 'TipsUsingTool',
  data() {
    return {
      griddedRouteNames: ['cansips', 'rdpa', 'cangrd', 'cmip5', 'dcs']
    }
  },
  computed: {
    textTipUsingToolStation: function () {
      return {
        tipPoints: [
          this.$gettext('use map filters to narrow down the selection on the map'),
          this.$gettext('select stations on the map or in the table by clicking on them'),
          this.$gettext('to see only selected stations in the table, click the "Show selected" button'),
          this.$gettext('deselect a station by clicking on it again in the table'),
          this.$gettext('deselect all stations by clicking the "Clear selected" button'),
          this.$gettext('only 20 stations can be selected at once'),
          this.$gettext('alternatively, for most datasets, you can select all stations within a province or territory with the "Province/Territory" menu')
        ]
      }
    },
    textTipUsingToolGridded: function () {
      return {
        use: this.$gettext('Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada\'s datasets.'),
        instructions: this.$gettext('You can specify the date ranges, variables, download format and other options. Use the map to select a geographic subset of the data. The geographic subset of the data that you download will match the area shown on the map. Download the data by clicking on the data download link at the bottom of the page.')
      }
    }
  }
}
</script>
