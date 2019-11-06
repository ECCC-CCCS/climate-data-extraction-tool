<template>
  <section
    class="alert alert-info"
    v-show="descriptionHtml[$i18n.activeLocale] !== ''">
    <h3><translate>Latest changes</translate></h3>
    <p v-html="descriptionHtml[$i18n.activeLocale]"></p>
    <p>
      <small class="text-muted text-left"><translate>Date:</translate> {{createdDate}}</small>
      <small class="text-muted text-right pull-right"><a :href="urlRepoGitRelease" target="_blank"><translate>View releases on GitHub</translate></a></small>
    </p>
  </section>
</template>

<script>
export default {
  name: 'LatestRelease',
  mounted () {
    this.$store.dispatch('retrieveLatestRelease', this.urlGitReleaseAPI)
  },
  data () {
    return {
      urlGitReleaseAPI: 'https://api.github.com/repos/ECCC-CCCS/climate-data-extraction-tool/releases/latest',
      urlRepoGitRelease: 'https://github.com/ECCC-CCCS/climate-data-extraction-tool/releases'
    }
  },
  computed: {
    latestRelease: function () {
      return this.$store.getters.getLatestRelease
    },
    releaseName: function () {
      return this.latestRelease.name
    },
    descriptionHtml: function () {
      let bodyHtml = {
        en: '',
        fr: ''
      }
      if (this.latestRelease.hasOwnProperty('body')) {
        let bodyParts = this.latestRelease.body.split('\r\n\r\n')
        bodyHtml.en = bodyParts[0].trim().replace(/\r\n/g, '<br>')
        bodyHtml.fr = bodyParts[1].trim().replace(/\r\n/g, '<br>')
      }

      return bodyHtml
    },
    createdDate: function () {
      let createdMoment = this.$moment.utc(this.latestRelease.created_at, 'YYYY-MM-DD[T]HH:mm:ss')
      return createdMoment.format('YYYY-MM-DD')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
