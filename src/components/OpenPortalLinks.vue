<template>
  <p>
    {{ openPortalListHtml }}
    <ul>
      <li
        v-for="(variable, index) in openPortalVariables"
        v-bind:key="index"><a v-bind:href="variable.url[$i18n.activeLocale]" target="_blank">{{ variable.name }}</a></li>
    </ul>
  </p>
</template>

<script>
export default {
  name: 'OpenPortalLinks',
  props: {
    openPortalListHtml: String,
    openPortalVariables: {
      type: Array,
      default: function () {
        return []
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
