<template>
  <nav class="wb-sec col-md-3 col-md-pull-9" typeof="SiteNavigationElement" id="wb-sec" role="navigation">
    <h2 id="wb-sec-h" class="wb-inv" v-translate t-context="Canada.ca Theme">Section menu</h2>
    <section class="list-group menu list-unstyled">
      <h3>
        <router-link
          to="/"><translate t-context="Title">Climate data extraction tool</translate></router-link>
      </h3>
      <ul class="list-group menu list-unstyled mrgn-lft-0-important">
        <li>
          <details>
            <summary class="list-group-item"><translate>Climate projections</translate> <span v-text="`(${climateSimulationRoutes.length})`"></span></summary>
            <ul class="list-group menu list-unstyled mrgn-lft-0-important">
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
                        :title="datasetTitles[route.name].abbrName">{{ datasetTitles[route.name].abbr }}</abbr>)
                    </span>
                  </router-link>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <details>
            <summary class="list-group-item"><translate>Climate predictions</translate> <span v-text="`(${climatePredictionRoutes.length})`"></span></summary>
            <ul class="list-group menu list-unstyled mrgn-lft-0-important">
              <li
                v-for="route in climatePredictionRoutes"
                :key="route.name">
                  <router-link
                    :to="route.meta[currentLangPath]"
                    class="list-group-item"
                    :class="{'wb-navcurr': $route.name === route.name}">
                    {{ datasetTitles[route.name].title }}
                    <span v-if="datasetTitles[route.name].abbr !== null">
                      (<abbr
                        :title="datasetTitles[route.name].abbrName">{{ datasetTitles[route.name].abbr }}</abbr>)
                    </span>
                  </router-link>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <details>
            <summary class="list-group-item"><translate>Value-added historical climate data products</translate> <span v-text="`(${valueAddedHistClimProdRoutes.length})`"></span></summary>
            <ul class="list-group menu list-unstyled mrgn-lft-0-important">
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
                        :title="datasetTitles[route.name].abbrName">{{ datasetTitles[route.name].abbr }}</abbr>)
                    </span>
                  </router-link>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <details>
            <summary class="list-group-item"><translate>Historical climate and river data</translate> <span v-text="`(${histClimateRiverRoutes.length})`"></span></summary>
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
                        :title="datasetTitles[route.name].abbrName">{{ datasetTitles[route.name].abbr }}</abbr>)
                    </span>
                  </router-link>
              </li>
            </ul>
          </details>
        </li>
        <li>
          <a class="btn btn-success btn-block" :href="supportDeskLink[activeLocale]" target="_blank"><span class="glyphicon glyphicon-bullhorn"></span> <translate>Help us improve!</translate></a>
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
      return this.$router.options.routes.filter((row) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'histClimateRiver')
      })
    },
    climateSimulationRoutes: function () {
      return this.$router.options.routes.filter((row) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'climateSimulation')
      })
    },
    climatePredictionRoutes: function () {
      return this.$router.options.routes.filter((row) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'climatePrediction')
      })
    },
    valueAddedHistClimProdRoutes: function () {
      return this.$router.options.routes.filter((row) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'valueAddedHistClimProd')
      })
    }
  }
}
</script>

<style scoped>
.mrgn-lft-0-important {
  margin-left: 0px !important;
}
</style>
