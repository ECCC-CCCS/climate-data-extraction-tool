<template>
  <nav class="wb-sec col-md-3 col-md-pull-9" typeof="SiteNavigationElement" id="wb-sec" role="navigation">
    <h2 id="wb-sec-h" class="wb-inv" v-translate t-context="Canada.ca Theme">Section menu</h2>
    <section class="list-group menu list-unstyled">
      <h3>
        <router-link
          to="/"><translate t-context="Title">Climate data extraction tool</translate></router-link>
      </h3>
      <ul class="list-group menu list-unstyled">
        <li>
          <span class="list-group-item" v-translate>Climate simulations</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in climateSimulationRoutes"
              :key="route.name">
                <router-link
                  :to="route.meta[currentLangPath]"
                  class="list-group-item"
                  :class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      :title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
                  </span>
                </router-link>
            </li>
          </ul>
        </li>
        <li>
          <span class="list-group-item" v-translate>Value-added historical climate data products</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in valueAddedHistClimProdRoutes"
              :key="route.name">
                <router-link
                  :to="route.meta[currentLangPath]"
                  class="list-group-item"
                  :class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      :title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
                  </span>
                </router-link>
            </li>
          </ul>
        </li>
        <li>
          <span class="list-group-item" v-translate>Historical climate and river data</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in histClimateRiverRoutes"
              :key="route.name">
                <router-link
                  :to="route.meta[currentLangPath]"
                  class="list-group-item"
                  :class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      :title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
                  </span>
                </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </section>
  </nav>
</template>

<script>
import { datasets } from './mixins/datasets'

export default {
  name: 'DatasetMenu',
  mixins: [datasets],
  computed: {
    histClimateRiverRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'histClimateRiver')
      })
    },
    climateSimulationRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'climateSimulation')
      })
    },
    valueAddedHistClimProdRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'valueAddedHistClimProd')
      })
    }
  }
}
</script>

<style>
</style>
