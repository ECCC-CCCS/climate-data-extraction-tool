<template>
  <section>
    <h1>{{ currentRouteTitle }}</h1>

    <latest-release></latest-release>

    <p v-translate>Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada's datasets. You can specify the date ranges, variables, download format and other options.</p>

    <strong v-translate>Get started</strong>
    <ol>
      <li v-translate>Select a dataset from the menu to the left</li>
      <li v-translate>Select your locations/stations of interest</li>
      <li v-translate>Specify the rest of your download request</li>
      <li v-translate>Click "retrieve your download links" at the bottom of the page and then download the data from the links provided</li>
    </ol>

    <more-resources></more-resources>
  </section>
</template>

<script>

import MoreResources from '@/components/MoreResources'
import LatestRelease from '@/components/LatestRelease'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'

export default {
  name: 'Home',
  mixins: [ows, datasets],
  components: {
    MoreResources,
    LatestRelease
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
