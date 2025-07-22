<template>
  <div class="form-group">
    <div
    :class="radioClass"
    v-for="(radioLabel, key) in radioOptions"
    :key="key">
      <label
      :for="'val-radio-' + dashAndTrim(radioLabel)"
      class="form-check-label">
        <input
        :id="'val-radio-' + dashAndTrim(radioLabel)"
        class="form-check-input"
        type="radio"
        :name="'option-radio-' + label_id"
        :value="key+''"
        :checked="selectValue === key"
        @change="emitUpdatedValue">{{ radioLabel }}</label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OptionRadio',
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
      selectValue: this.value
    }
  },
  watch: {
    radioOptions: function (newOptions, oldOptions) {
      // auto select the first option if option list changes
      if (Object.keys(newOptions).length === 1 && Object.keys(newOptions).length !== Object.keys(oldOptions).length) {
        this.selectValue = Object.keys(newOptions)[0]
      }
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$emit('input', event.target.value)
    },
    dashAndTrim: function (str) {
      return str.replaceAll(' ', '-').replaceAll('.', '-').trim().toLowerCase()
    }
  },
  computed: {
    label_id: function () {
      return this.label.replaceAll(' ', '-').replaceAll('.', '-').trim().toLowerCase()
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
