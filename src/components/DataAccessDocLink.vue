<template>
  <p v-html="dataAccessDocHtml"></p>
</template>

<script>
export default {
  name: 'DataAccessDocLink',
  data () {
    return {
      dataAccessDocUrl: {
        en: '/environment-climate-change/services/climate-change/canadian-centre-climate-services/display-download/advanced-tools.html',
        fr: '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/afficher-telecharger/outil-avances.html'
      },
      canadaDomain: {
        en: process.env.VUE_APP_CANADA_SERVER_EN,
        fr: process.env.VUE_APP_CANADA_SERVER_FR
      }
    }
  },
  computed: {
    dataAccessDocHtml: function () {
      var link = this.canadaDomain[this.$i18n.activeLocale] + this.dataAccessDocUrl[this.$i18n.activeLocale]
      var html = this.$gettext('The Canadian Centre for Climate Services also provides both a Datamart and application program interfaces (API) that will allow you to access this dataset in a bulk and/or automated fashion. Please refer to <a href="{link}" target="_blank">the documentation on these advanced tools</a> for more information.')
      html = html.replace('{link}', link)
      return html
    }
  }
}
</script>

<style>
</style>
