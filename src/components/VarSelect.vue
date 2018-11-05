<template>
  <div class="form-group">
    <label
      v-bind:for="'var-sel-'+label_id"
      v-bind:class="{required: required}">{{ label }}
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
    <details v-bind:open="toggleDetailsState" v-if="detailsTitle !== null">
      <summary v-on:click="toggleDetails">{{ detailsTitle }}</summary>
      <p
        v-for="(paragraphText, index) in detailsText"
        :key="index"
        v-html="paragraphText"></p>
    </details>
    <select class="form-control" v-bind:id="'var-sel-'+label_id"
      v-bind:value="value"
      v-on:change="emitUpdatedValue"
      v-bind:required="required">
        <option v-for="(value, key) in selectOptions" v-bind:key="key" v-bind:value="key">{{ value }}</option>
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
          'null': this.$gettext('No options available')
        }
      }
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
    toggleDetails: function (event) {
      this.toggleDetailsState = !this.toggleDetailsState
    }
  },
  computed: {
    label_id: function () {
      return this.label.replace(' ', '-').trim()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
