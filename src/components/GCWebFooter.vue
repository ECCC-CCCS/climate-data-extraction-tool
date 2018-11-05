<template>
  <footer role="contentinfo" id="wb-info" v-if="$route.name !== '404'">
    <nav role="navigation" class="container wb-navcurr">
      <h2 class="wb-inv" v-translate t-context="Canada.ca Theme">About government</h2>
      <ul class="list-unstyled colcount-sm-2 colcount-md-3">
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/contact.html'" v-translate t-context="Canada.ca Theme">Contact us</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/government/dept.html'" v-translate t-context="Canada.ca Theme">Departments and agencies</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/government/publicservice.html'" v-translate t-context="Canada.ca Theme">Public service and military</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/news.html'" v-translate t-context="Canada.ca Theme">News</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/government/system/laws.html'" v-translate t-context="Canada.ca Theme">Treaties, laws and regulations</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/transparency/reporting.html'" v-translate t-context="Canada.ca Theme">Government-wide reporting</a></li>
        <li><a v-bind:href="'http://pm.gc.ca/' + activeLocale3" v-translate t-context="Canada.ca Theme">Prime Minister</a></li>
        <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/government/system.html'" v-translate t-context="Canada.ca Theme">How government works</a></li>
        <li><a v-bind:href="'http://open.canada.ca/' + activeLocale + '/'" v-translate t-context="Canada.ca Theme">Open government</a></li>
      </ul>
    </nav>
    <div class="brand">
      <div class="container">
        <div class="row">
          <nav class="col-md-9 col-lg-10 ftr-urlt-lnk">
            <h2 class="wb-inv" v-translate t-context="Canada.ca Theme">About this site</h2>
            <ul>
              <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/social.html'" v-translate t-context="Canada.ca Theme">Social media</a></li>
              <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/mobile.html'" v-translate t-context="Canada.ca Theme">Mobile applications</a></li>
              <li><a v-bind:href="'https://www1.canada.ca/' + activeLocale + '/newsite.html'" v-translate t-context="Canada.ca Theme">About Canada.ca</a></li>
              <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/transparency/terms.html'" v-translate t-context="Canada.ca Theme">Terms and conditions</a></li>
              <li><a v-bind:href="'https://www.canada.ca/' + activeLocale + '/transparency/privacy.html'" v-translate t-context="Canada.ca Theme">Privacy</a></li>
            </ul>
          </nav>
          <div class="col-xs-6 visible-sm visible-xs tofpg">
            <a href="#wb-cont"><translate t-context="Canada.ca Theme">Top of Page</translate> <span class="glyphicon glyphicon-chevron-up"></span></a>
          </div>
          <div class="col-xs-6 col-md-3 col-lg-2 text-right">
            <img src="https://www.canada.ca/etc/designs/canada/wet-boew/assets/wmms-blk.svg" v-bind:alt="$pgettext('Canada.ca Theme', 'Symbol of the Government of Canada')">
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
import { ows } from './mixins/ows'
import { datasets } from './mixins/datasets'

export default {
  name: 'GCWebFooter',
  mixins: [ows, datasets]
}
</script>

<style>
</style>
