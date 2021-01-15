<template>
  <div>
    <div class="form-group">
      <label
        :for="'num'+label_id"
        :class="{required: required}">
        {{ label }}
        <strong
          v-if="required"
          class="required"
          aria-required="true"
          v-translate>(Required)</strong>
        <strong
          v-show="invalidMsg" class="error">
          <span class="label label-danger">
            <span class="prefix" v-translate>Error:</span>
            {{ invalidMsg }}
          </span>
        </strong>
      </label>
      <input
        type="number"
        class="form-control"
        :id="'num'+label_id"
        @change="emitUpdatedValue"
        :min="min"
        :max="max"
        :value="value">
    </div>
  </div>
</template>

<script>
export default {
  name: 'NumSelect',
  props: {
    value: [Number, String],
    label: {
      type: String,
      default: 'Number'
    },
    min: Number,
    max: Number,
    required: {
      type: Boolean,
      default: false
    },
    customErrorMsg: {
      type: String,
      default: ''
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$emit('input', event.target.value)
    }
  },
  computed: {
    label_id: function () {
      return this.label.replaceAll(' ', '-').replaceAll('/', '').toLowerCase().trim()
    },
    invalidMsg: function () {
      if (this.customErrorMsg !== '') { // custom error
        return this.customErrorMsg
      } else if (!this.required && this.value === '') {
        return false
      } else if (this.value > this.maxNum) {
        return this.$gettext('This field must be less than or equal to:') + ' ' + this.maxNum
      } else if (this.value < this.minNum) {
        return this.$gettext('This field must be greater than or equal to:') + ' ' + this.minNum
      } else if (this.required && (this.value === '' || this.value === null)) {
        return this.$gettext('This field is required.')
      } else {
        return false
      }
    },
    markInvalid: function () {
      return this.invalidMsg
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
