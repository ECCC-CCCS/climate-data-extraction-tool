<template>
  <section id="more-resources" class="panel panel-info mrgn-tp-lg">
    <header class="panel-heading">
      <h5 class="panel-title" v-translate>More resources from the Canadian Centre for Climate Services</h5>
    </header>
    <div class="panel-body">
      <ul class="list-unstyled">
        <li class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <a
            :href="climateLibraryLink[activeLocale]"
            target="_blank"
            class="btn-default well text-left"
            style="display: block; text-decoration: none;">
            <img src="../assets/cccs_icons/3book-icon-tr.png" alt="" width="30" height="30">&nbsp;<strong v-translate>Library of climate resources</strong><span v-translate t-comment="A title/word precedes this colon without spaces">: links to datasets, tools, guidance and related resources</span>
          </a>
        </li>
        <li class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <a
            :href="climateInfoBasic[activeLocale]"
            target="_blank"
            class="btn-default well text-left"
            style="display: block; text-decoration: none;">
            <img src="../assets/cccs_icons/book-icon-tr.png" width="30" alt="" height="30">&nbsp;<strong v-translate>Climate information basics</strong><span v-translate t-comment="A title/word precedes this colon without spaces">: climate change trends, climate science, climate services</span>
          </a>
        </li>
        <li class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <a
            :href="supportDeskLink[activeLocale]"
            target="_blank"
            class="btn-default well text-left"
            style="display: block; text-decoration: none;">
            <img src="../assets/cccs_icons/help-icon-tr.png" alt="" width="30" height="30">&nbsp;<strong v-translate>Contact the Climate Services Support Desk</strong><span v-translate t-comment="A title/word precedes this colon without spaces">: 1-833-517-0376; get help finding, understanding and using climate information</span>
          </a>
        </li>
        <li class="col-lg-12 col-md-12 col-sm-12 col-xs-12">
          <a
            :href="climateLinks.climateDisplay.url[activeLocale]"
            target="_blank"
            class="btn-default well text-left"
            style="display: block; text-decoration: none;">
            <img src="../assets/cccs_icons/graph-icon-tr.png" alt="" width="30" height="30">&nbsp;<strong v-translate>Display and download climate data</strong><span v-translate t-comment="A title/word precedes this colon without spaces">: search, explore and visualize climate data</span>
          </a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
import { datasets } from './mixins/datasets'

export default {
  name: 'MoreResources',
  mixins: [datasets],
  computed: {
    climateInfoBasic: function () {
      return {
        en: this.canadaDomain.en + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/basics.html',
        fr: this.canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/essentiels.html'
      }
    },
    titleMoreResourcesHtml: function () {
      let link = this.climateLinks.climateServices.url[this.activeLocale]
      let htmlTitle = this.$gettext('More resources from the <a href="{link}" target="_blank">Canadian Centre for Climate Services</a>')
      htmlTitle = htmlTitle.replace('{link}', link)
      return htmlTitle
    }
  }
}
</script>

<style>
</style>
