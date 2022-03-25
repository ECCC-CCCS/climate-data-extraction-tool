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

    <carousel :perPage="1" :autoplay="true" :loop="true" role="img" aria-live="polite">
      <slide>
        <img src="../assets/carousel/ExtAHCCD.png" class="img-responsive center" alt="Carousel image preview: AHCCD station point on map" />
      </slide>
      <slide>
        <img src="../assets/carousel/ExtCanGrd.png" class="img-responsive center" alt="Carousel image preview: CanGrd intro" />
      </slide>
      <slide>
        <img src="../assets/carousel/ExtCMIP.png" class="img-responsive center" alt="Carousel image preview: CMIP5 map options"/>
      </slide>
      <slide>
        <img src="../assets/carousel/ExtDaily.png" class="img-responsive center" alt="Carousel image preview: Daily station point on map" />
      </slide>
      <slide>
        <img src="../assets/carousel/ExtDCSOptions.png" class="img-responsive center" alt="Carousel image preview: DCS page options" />
      </slide>
      <slide>
        <img src="../assets/carousel/ExtHourly.png" class="img-responsive center" alt="Carousel image preview: Hourly station point on map" />
      </slide>
      <slide>
        <img src="../assets/carousel/ExtLTCE.png" class="img-responsive center" alt="Carousel image preview: LTCE station point on map"/>
      </slide>
      <slide>
        <img src="../assets/carousel/ExtNorm.png" class="img-responsive center" alt="Carousel image preview: Normals station point on map" />
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
  name: 'Home',
  mixins: [ows, datasets],
  components: {
    MoreResources,
    LatestRelease,
    Carousel,
    Slide
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
