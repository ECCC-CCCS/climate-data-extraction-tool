<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="col-md-9 col-md-push-3">
        <h1>{{ currentRouteTitle }}</h1>

        <p v-translate>Use the climate data extraction tool to download climate data from the selected Environment and Climate Change Canada' datasets. You can specify the date ranges, variables, download format and other options.</p>

        <info-contact-support></info-contact-support>

        <more-resources></more-resources>
      </main>
      <dataset-menu></dataset-menu>
    </div>
  </div>
</template>

<script>
import DatasetMenu from './DatasetMenu'
import InfoContactSupport from './InfoContactSupport'
import MoreResources from './MoreResources'
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'Home',
  mixins: [ows, datasets],
  components: {
    'dataset-menu': DatasetMenu,
    'info-contact-support': InfoContactSupport,
    'more-resources': MoreResources
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
