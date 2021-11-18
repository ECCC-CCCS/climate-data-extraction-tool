<template>
  <details>
    <summary>{{ textTipUsingTool.station.tipTitle }}</summary>
    <ul>
      <li
        v-for="(pointText, index) in textTipUsingTool.station.tipPoints"
        :key="index">{{ pointText }}</li>
    </ul>
  </details>
</template>

<script>
export default {
  name: 'TipsUsingTool',
  computed: {
    textTipUsingTool: function () {
      return {
        station: {
          tipTitle: this.$gettext('Tips for using the tool'),
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
      }
    }
  }
}
</script>
