<template>
  <div>
  </div>
</template>

<script>
export default {
  name: 'MetadataLink',
  props: {
    openDataId: {
      type: String,
      default: null
    }
  },
  computed: {
    openDataDatasetBaseUrl: function () {
      return {
        en: 'https://open.canada.ca/data/en/dataset/',
        fr: 'https://ouvert.canada.ca/data/fr/dataset/'
      }
    },
    metadataLink: function () {
      return this.openDataDatasetBaseUrl[this.$i18n.activeLocale] // + this.openDataId
    }
  }
}
</script>

<style>
</style>
