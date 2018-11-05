<template>
  <div class="form-group">
    <label for="cccs_province" v-translate>Province/Territory</label>
    <select class="form-control" id="cccs_province"
    v-bind:disabled="disabled"
    v-on:change="emitUpdatedValue">
      <option
        v-for="(provLabel, key) in selectOptions"
        v-bind:key="key"
        v-bind:value="key"
        v-bind:selected="value === key">{{ provLabel }}</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'ProvinceSelect',
  props: {
    value: String,
    required: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      selectOptions: {
        null: this.$pgettext('Select option for None in a dropdown menu', '-- None --'),
        AB: this.$gettext('Alberta'),
        BC: this.$gettext('British Columbia'),
        MB: this.$gettext('Manitoba'),
        NB: this.$gettext('New Brunswick'),
        NL: this.$gettext('Newfoundland and Labrador'),
        NT: this.$gettext('Northwest Territories'),
        NS: this.$gettext('Nova Scotia'),
        NU: this.$gettext('Nunavut'),
        ON: this.$gettext('Ontario'),
        PE: this.$gettext('Prince Edward Island'),
        QC: this.$gettext('Quebec'),
        SK: this.$gettext('Saskatchewan'),
        YT: this.$gettext('Yukon')
      }
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$store.dispatch('clearStationIdSelected')
      this.$emit('input', event.target.value)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
