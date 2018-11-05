<template>
  <div>
    <span class="small bg-info text-info">
      <span class="glyphicon glyphicon-info-sign"></span>
      <span v-html="htmlMetadataLink"></span>
    </span>
  </div>
</template>

<script>
export default {
  name: 'MetadataLink',
  props: {
    openDataId: String,
    datasetName: String
  },
  computed: {
    openDataDatasetBaseUrl: function () {
      return {
        en: 'https://open.canada.ca/data/en/dataset/',
        fr: 'https://ouvert.canada.ca/data/fr/dataset/'
      }
    },
    metadataLink: function () {
      return this.openDataDatasetBaseUrl[this.$i18n.activeLocale] + this.openDataId
    },
    htmlMetadataLink: function () {
      return this.$_i(this.$gettext('See <a href="{metadataLink}" target="_blank">technical documentation on {datasetName}</a> for more detailed information on this dataset.'), this)
    }
  }
}
</script>

<style>
</style>
