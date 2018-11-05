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
          <span class="list-group-item" v-translate>Historical and future climate projections</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in datasetProjectionRoutes"
              v-bind:key="route.name">
                <router-link
                  v-bind:to="route.meta[currentLangPath]"
                  class="list-group-item"
                  v-bind:class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      v-bind:title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
                  </span>
                </router-link>
            </li>
          </ul>
        </li>
        <li>
          <span class="list-group-item" v-translate>Historical station data</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in datasetStationRoutes"
              v-bind:key="route.name">
                <router-link
                  v-bind:to="route.meta[currentLangPath]"
                  class="list-group-item"
                  v-bind:class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      v-bind:title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
                  </span>
                </router-link>
            </li>
          </ul>
        </li>
        <li>
          <span class="list-group-item" v-translate>Historical gridded data</span>
          <ul class="list-group menu list-unstyled">
            <li
              v-for="route in datasetGriddedRoutes"
              v-bind:key="route.name">
                <router-link
                  v-bind:to="route.meta[currentLangPath]"
                  class="list-group-item"
                  v-bind:class="{'wb-navcurr': $route.name === route.name}">
                  {{ datasetTitles[route.name].title }}
                  <span v-if="datasetTitles[route.name].abbr !== null">
                    (<abbr
                      v-bind:title="datasetTitles[route.name].title">{{ datasetTitles[route.name].abbr }}</abbr>)
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
    datasetStationRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'station')
      })
    },
    datasetGriddedRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'gridded')
      })
    },
    datasetProjectionRoutes: function () {
      return this.$router.options.routes.filter((row, index) => {
        // only return routes marked to display for dataset section menu
        return row.meta.datasetSectionMenu && (row.meta.group === 'projection')
      })
    }
  }
}
</script>

<style>
</style>
