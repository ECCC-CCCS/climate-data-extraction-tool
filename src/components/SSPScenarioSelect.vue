<template>
  <div class="form-group">
    <label
      for="ssp_scenario"
      :class="{required: required}">
      {{ this.label }}
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
      <br>
    </label>
    <select class="form-control" id="ssp_scenario"
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
          'null': 'N/A' // this.$gettext('No options available')
        }
      }
    },
    required: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    label: function () {
      return this.$gettext('Emissions scenario')
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
