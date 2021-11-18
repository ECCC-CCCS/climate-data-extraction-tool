<template>
  <div
    class="form-group"
    :class="{'has-error': markInvalid}">
    <label
      :for="'date-' + label_id"
      :class="{required: required}">
      {{ label }}
      <span
        class="date_format"
        v-html="htmlDateFormatAbbr"></span>&nbsp;
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
    <datepicker
      :value="value"
      :id="'date-' + label_id"
      :input-class="'form-control'"
      :typeable="true"
      :format="dateFormatter"
      :placeholder="placeholder"
      :minimum-view="minimumView"
      :maximum-view="maximumView"
      :language="useDateLang"
      :required="required"
      :disabledDates="disabledDates"
      :use-utc="useUtc"
      :disabled="disabled"
      :readonly="readonly"
      @input="debounceValue"></datepicker>
  </div>
</template>

<script>
import Datepicker from 'vuejs-datepicker'
import {en, fr} from 'vuejs-datepicker/dist/locale'

export default {
  name: 'DateSelect',
  components: {
    datepicker: Datepicker
  },
  props: {
    value: [Date, String],
    useUtc: {
      type: Boolean,
      default: true // use UTC
    },
    minDate: Date, // this.$moment.utc('1800-01-01', 'YYYY-MM-DD').toDate()
    maxDate: Date, // this.$moment.utc().toDate()
    placeholder: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    label: {
      type: String,
      default: 'Date'
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD'
    },
    minimumView: {
      type: String,
      default: 'day'
    },
    maximumView: {
      type: String,
      default: 'year'
    },
    required: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    customErrorMsg: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      dateValue: this.value,
      debounce: null,
      dateConfig: {
        lang: {
          en: en,
          fr: fr
        }
      }
    }
  },
  watch: {
    format: function (newFormat, oldFormat) {
      this.dateValue = this.value
      // avoid moment parse warnings
      if (typeof this.value === 'string') {
        this.dateValue = this.$moment.utc(this.value, oldFormat).toDate()
      }
      this.emitUpdatedValue(this.dateValue)
    }
  },
  computed: {
    label_id: function () {
      return this.label.replaceAll(' ', '-').replaceAll('/', '').toLowerCase().trim()
    },
    useDateLang: function () {
      return this.dateConfig.lang[this.$i18n.activeLocale]
    },
    disabledDates: function () {
      return {
        from: this.$moment.utc(this.maxDate).toDate(),
        to: this.$moment.utc(this.minDate).toDate()
      }
    },
    dateMoment: function () {
      // value can be string or date object; parse appropriately
      if (this.value instanceof Date) {
        return this.$moment.utc(this.value)
      } else {
        return this.$moment.utc(this.value, this.format)
      }
    },
    limitMoment: function () {
      return {
        min: this.$moment.utc(this.minDate),
        max: this.$moment.utc(this.maxDate)
      }
    },
    dateWithinLimits: function () {
      // ignore check if empty
      if (this.value === '' || this.value === null) {
        return true
      }
      return this.dateMoment.isBetween(this.limitMoment.min, this.limitMoment.max, this.minimumView, '[]')
    },
    invalidMsg: function () {
      if (this.customErrorMsg !== '') { // custom error
        return this.customErrorMsg
      } else if (this.required && (this.value === 'Invalid date' || this.value === null)) {
        return this.$gettext('This field is required.')
      } else if (!this.dateWithinLimits) {
        return this.$gettext('This field is not within the date range limits.')
      } else {
        return false
      }
    },
    markInvalid: function () {
      if (typeof this.invalidMsg === 'string') {
        return true
      } else {
        return this.invalidMsg
      }
    },
    htmlDateFormatAbbr: function () {
      let htmlDateFormat
      let yyyyTitle = this.$gettext('4 digit year')
      let mmTitle = this.$gettext('2 digit month')
      let ddTitle = this.$gettext('2 digit day of month')
      switch (this.format) {
        case 'YYYY-MM-DD':
          htmlDateFormat = '(<abbr title="' + yyyyTitle + '">YYYY</abbr>-<abbr title="' + mmTitle + '">MM</abbr>-<abbr title="' + ddTitle + '">DD</abbr>)'
          break
        case 'YYYY-MM':
          htmlDateFormat = '(<abbr title="' + yyyyTitle + '">YYYY</abbr>-<abbr title="' + mmTitle + '">MM</abbr>)'
          break
        case 'YYYY':
          htmlDateFormat = '(<abbr title="' + yyyyTitle + '">YYYY</abbr>)'
          break
        case 'MM-DD':
          htmlDateFormat = '(<abbr title="' + mmTitle + '">MM</abbr>-<abbr title="' + ddTitle + '">DD</abbr>)'
          break
      }
      return htmlDateFormat
    }
  },
  methods: {
    debounceValue: function(updDate) {
      clearTimeout(this.debounce) // debounce input
      this.debounce = setTimeout(() => {
        this.emitUpdatedValue(updDate)
      }, 600)
    },
    emitUpdatedValue: function (updDate) {
      this.$emit('input', this.dateFormatter(updDate))
    },
    dateFormatter: function (date) {
      return this.$moment.utc(date).format(this.format)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.vdp-datepicker__calendar {
  z-index: 500 !important; /* go over leaflet map */
}
</style>
