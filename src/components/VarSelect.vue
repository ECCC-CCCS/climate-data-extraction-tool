<template>
  <div class="form-group">
    <label
      :for="'var-sel-'+label_id"
      :class="{required: required}">{{ label }}
      <strong
        v-if="required"
        class="required"
        aria-required="true"
        v-translate>(Required)</strong>
      <span v-if="infoText !== null">
        <br>
        <div v-for="(info, index) in infoText" :key="index">
          <span class="small bg-info text-info">
            <span class="glyphicon glyphicon-info-sign"></span>
            <span v-html="$_i(info.text, {link: info.link[$i18n.activeLocale]})"></span>
          </span>
        </div>
      </span>
    </label>
    <details :open="toggleDetailsState" v-if="detailsTitle !== null">
      <summary @click="toggleDetails">{{ detailsTitle }}</summary>
      <p
        v-for="(paragraphText, index) in detailsText"
        :key="index"
        v-html="paragraphText"></p>
    </details>
    <select class="form-control" :id="'var-sel-'+label_id"
      :value="value"
      @change="emitUpdatedValue"
      :disabled="disabled || oneOptionOnly"
      :readonly="readonly"
      :required="required">
        <option v-for="(value, key) in selectOptions" :key="key" :value="key">{{ value }}</option>
    </select>
  </div>
</template>

<script>
export default {
  name: 'VarSelect',
  props: {
    value: String,
    label: {
      type: String,
      default: 'Variable'
    },
    selectOptions: {
      type: Object,
      default: function () {
        return {
          'null': 'N/A' // this.$gettext('No options available')
        }
      }
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: true
    },
    infoText: {
      type: Array,
      default: null
    },
    detailsText: {
      type: Array, // each index is a <p>; html enabled
      default: function () {
        return []
      }
    },
    detailsTitle: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      toggleDetailsState: false
    }
  },
  methods: {
    emitUpdatedValue: function (event) {
      this.$emit('input', event.target.value)
    },
    toggleDetails: function () {
      this.toggleDetailsState = !this.toggleDetailsState
    }
  },
  computed: {
    label_id: function () {
      return this.label.replaceAll(' ', '-').replaceAll('/', '').toLowerCase().trim()
    },
    oneOptionOnly: function () {
      return Object.keys(this.selectOptions).length <= 1
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
