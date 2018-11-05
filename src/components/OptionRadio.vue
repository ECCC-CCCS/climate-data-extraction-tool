<template>
  <div class="form-group">
    <div
    v-bind:class="radioClass"
    v-for="(radioLabel, key) in radioOptions"
    v-bind:key="key">
      <label
      v-bind:for="'val-radio-' + dashAndTrim(radioLabel)"
      class="form-check-label">
        <input
        v-bind:id="'val-radio-' + dashAndTrim(radioLabel)"
        class="form-check-input"
        type="radio"
        v-bind:name="'option-radio-' + label_id"
        v-bind:value="key"
        v-model="optionSelected"
        v-on:change="emitUpdatedValue">{{ radioLabel }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionRadio',
  model: {
    prop: 'optionSelected',
    event: 'change'
  },
  props: {
    value: String,
    label: {
      type: String,
      default: 'Options'
    },
    initialValue: {
      type: String,
      default: null
    },
    radioOptions: {
      type: Object,
      default: function () {
        return {}
      }
    },
    required: {
      type: Boolean,
      default: true
    },
    radioInline: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      optionSelected: this.initialValue
    }
  },
  watch: {
    radioOptions: function (newOptions, oldOptions) {
      // auto select the first option if option list changes
      if (Object.keys(newOptions).length === 1 && Object.keys(newOptions).length !== Object.keys(oldOptions).length) {
        this.optionSelected = Object.keys(newOptions)[0]
      }
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$emit('change', this.optionSelected)
    },
    dashAndTrim: function (str) {
      return str.replace(' ', '-').replace('.', '-').trim()
    }
  },
  computed: {
    label_id: function () {
      return this.label.replace(' ', '-').replace('.', '-').trim()
    },
    radioClass: function () {
      return {
        radio: !this.radioInline,
        'radio-inline': this.radioInline
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
