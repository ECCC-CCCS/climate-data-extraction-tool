<template>
  <div class="form-group">
    <label
      for="rcp_scenario"
      :class="{required: required}">
      <translate>Emissions scenario</translate>
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
      <br>
      <span
        class="small bg-info text-info">
        <span class="glyphicon glyphicon-info-sign"></span>
        <a
          :href="rcp_link[$i18n.activeLocale]"
          target="_blank"
          v-translate>Learn more about emissions scenarios</a>
      </span>
    </label>
    <select class="form-control" id="rcp_scenario"
      :value="value"
      @change="emitUpdatedValue">
        <option
          v-for="(scenarioValue, key) in selectOptions"
          :key="key"
          :value="key"
          v-html="scenarioValue"
          :required="required"></option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'ScenarioSelect',
  props: {
    value: String,
    selectOptions: {
      type: Object,
      default: function () {
        return {
          'null': this.$gettext('No options available')
        }
      }
    },
    required: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      rcp_link: {
        en: process.env.CANADA_SERVER_EN + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/basics/scenario-models.html#toc0',
        fr: process.env.CANADA_SERVER_FR + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/essentiels/scenarios-modeles.html#toc0'
      }
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
