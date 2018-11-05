<template>
  <ul id="wb-tphp" v-if="$route.name !== '404'">
    <li class="wb-slc">
      <a class="wb-sl" href="#wb-cont" v-translate t-context="Canada.ca Theme">Skip to main content</a>
    </li>
    <li class="wb-slc">
      <a class="wb-sl" href="#wb-info" v-translate t-context="Canada.ca Theme">Skip to "About government"</a>
    </li>
  </ul>
</template>

<script>
export default {
  name: 'GCWebSkip'
}
</script>

<style>
</style>
