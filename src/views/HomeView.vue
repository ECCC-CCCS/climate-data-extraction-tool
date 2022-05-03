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

    <carousel :perPage="1" :autoplay="true" :loop="true" :navigationEnabled="true" role="img" aria-live="polite">
      <slide v-for="(altText, imgName) in altCarouselImg" :key="imgName">
        <img :src="require(`@/assets/carousel_${$i18n.activeLocale}/${imgName}`)" class="img-responsive center" :alt="altText" />
      </slide>
    </carousel>

    <more-resources></more-resources>
  </section>
</template>

<script>
import { Carousel, Slide } from 'vue-carousel'
import MoreResources from '@/components/MoreResources'
import LatestRelease from '@/components/LatestRelease'
import { ows } from '@/components/mixins/ows'
import { datasets } from '@/components/mixins/datasets'

export default {
  name: 'HomeView',
  mixins: [ows, datasets],
  components: {
    MoreResources,
    LatestRelease,
    Carousel,
    Slide
  },
  computed: {
    altCarouselImg: function () {
      return {
        'slide1.png': this.$gettext('Example page preview: Global climate model scenarios (CMIP5)'),
        'slide2.png': this.$gettext('Example page preview: Canadian statistically downscaled climate scenarios'),
        'slide3.png': this.$gettext('Example page preview: Adjusted and Homogenized Canadian Climate Data (AHCCD)'),
        'slide4.png': this.$gettext('Example page preview: Canadian Gridded Temperature and Precipitation Anomalies (CANGRD)'),
        'slide5.png': this.$gettext('Example page preview: 1981-2010 Climate Normals'),
        'slide6.png': this.$gettext('Example page preview: Daily Data')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.center {
  margin-left: auto;
  margin-right: auto;
  position: relative;
  top: 50%;
  transform: translateY(-50%);
}
</style>
