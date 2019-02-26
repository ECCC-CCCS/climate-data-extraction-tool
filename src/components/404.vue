<template>
  <div class="container">
    <div class="row">
      <main role="main" property="mainContentOfPage" class="container">
        <div class="row">
          <h1 class="wb-inv">{{ h1TitleHtml }}</h1>
          <div v-for="lang in langPriority" :key="lang">
            <section v-if="lang === 'en'" class="col-md-6" lang="en">
              <h2><span class="glyphicon glyphicon-warning-sign mrgn-rght-md"></span> {{ title404.en }}</h2>
              <p>We're sorry you ended up here. Sometimes a page gets moved or deleted, but hopefully we can help you find what you're looking for.</p>
              <ul>
                <li>Return to <a :href="canadaDomain.en + '/environment-climate-change/services/climate-change/adapting/climate-services-data-resources-support.html'">Climate services: data, resources and support</a></li>
                <li>Return to the <a :href="href_to_home('en')">home page</a></li>
              </ul>
            </section>
            <section v-if="lang === 'fr'" class="col-md-6" lang="fr">
              <h2><span class="glyphicon glyphicon-warning-sign mrgn-rght-md"></span> {{ title404.fr }}</h2>
              <p>Nous sommes désolés que vous ayez abouti ici. Il arrive parfois qu'une page ait été déplacée ou supprimée. Heureusement, nous pouvons vous aider à trouver ce que vous cherchez.</p>
              <ul>
                <li>Retournez aux <a :href="canadaDomain.fr + '/environnement-changement-climatique/services/changements-climatiques/adapter/services-climatiques-donnees-ressources-soutien.html'">Services climatiques : données, ressources et soutien</a></li>
                <li>Retournez à la <a :href="href_to_home('fr')">page d'accueil</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'NotFound',
  mixins: [ows, datasets],
  data () {
    return {
      title404: {
        en: "We couldn't find that Web page (Error 404)",
        fr: 'Nous ne pouvons trouver cette page Web (Erreur 404)'
      },
      error404: {
        en: 'Error 404',
        fr: 'Erreur 404'
      }
    }
  },
  methods: {
    href_to_home: function (lang) {
      var src = '/'
      if (this.APP_PATH[lang] !== '/') {
        src = this.APP_PATH[lang] + '/'
      }
      return src + '#/'
    }
  },
  computed: {
    langPriority: function () {
      if (this.$i18n.activeLocale === 'fr') {
        return ['fr', 'en']
      } else { // en first
        return ['en', 'fr']
      }
    },
    h1TitleHtml: function () {
      if (this.$i18n.activeLocale === 'fr') {
        return '<span lang="fr">' + this.title404.fr + '</span> / <span lang="en"> ' + this.title404.en + '</span>'
      } else { // en
        return '<span lang="en">' + this.title404.en + '</span> / <span lang="fr"> ' + this.title404.fr + '</span>'
      }
    }
  }
}
</script>

<style scoped>
</style>
