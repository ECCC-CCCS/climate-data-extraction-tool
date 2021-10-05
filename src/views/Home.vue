<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <latest-release></latest-release>

        <p v-translate>Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada's datasets. You can specify the date ranges, variables, download format and other options.</p>

        <strong v-translate>Get started</strong>
        <ol>
          <li v-translate>Select a dataset from the menu</li>
          <li v-translate>Select your locations/stations of interest</li>
          <li v-translate>Specify the rest of your download request</li>
          <li v-translate>Retrieve your download links and then download the data from the links provided</li>
        </ol>

        <more-resources></more-resources>
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from '@/components/DatasetMenu'
import MoreResources from '@/components/MoreResources'
import LatestRelease from '@/components/LatestRelease'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'

export default {
  name: 'Home',
  mixins: [ows, datasets],
  components: {
    DatasetMenu,
    MoreResources,
    LatestRelease
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
