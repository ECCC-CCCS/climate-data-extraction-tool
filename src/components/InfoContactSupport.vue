<template>
  <div class="alert alert-info">
    <h2 v-translate class="h4">Information</h2>
    <p v-html="pFeedback"></p>
    <p v-html="pOtherData"></p>
  </div>
</template>

<script>
import { datasets } from './mixins/datasets'

export default {
  name: 'InfoContactSupport',
  mixins: [datasets],
  computed: {
    pFeedback: function () {
      return this.$_i(this.$gettext('We value your feedback and are updating this tool continuously to ensure that it meets your needs. If you have any questions, comments or suggestions, <a href="{supportDeskUrl}">contact the Climate Services Support Desk</a>.'), this)
    },
    pOtherData: function () {
      return this.$_i(this.$gettext('If you are looking for other datasets, explore the <a href="{climateLibraryUrl}">Library of climate resources</a>.'), this)
    }
  }
}
</script>

<style>
</style>
