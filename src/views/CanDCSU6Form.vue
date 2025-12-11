<template>
  <section>
    <h1>{{ currentRouteTitle }} <small>({{ currentRouteAbbr }})</small></h1>
    
    <p v-translate>
      The Canadian Downscaled Climate Scenarios-Univariate method from CMIP6 (CanDCSU6) provides projected changes in temperature and precipitation for three emission scenarios at a 6x10km grid spatial resolution. Data is available for the 1950-2014 historical period and the 2015-2100 projected period. Statistically downscaled datasets have been produced from 26 CMIP6 Global Climate Models (GCMs) under three different emission scenarios (i.e., SSP1-2.6, SSP2-4.5, and SSP5-8.5) using the same downscaling method (Bias Correction/Constructed Analogues with Quantile mapping (BCCAQv2)) and downscaling target data (NRCANmet) as the CMIP5-based downscaled scenarios.
    </p>
    
    <tips-using-tool></tips-using-tool>
    
    <data-access-doc-link></data-access-doc-link>
    
    <details>
      <summary v-translate>Technical information and metadata</summary>
      
      <p v-html="openPortalHtml"></p>
    </details>
    
    <bbox-map
    v-model="mapBBOX"
    :file-formats="fileFormats"
    @change="splitBBOXString"></bbox-map>
    
    <var-select
    v-model="oapicIdVariable"
    :select-options="variableOptions"></var-select>
    
    <option-radio
    v-model="scenarioType"
    :radio-inline="true"
    :radio-options="scenarioTypeOptions"></option-radio>
    
    <var-select
    v-model="oapicIdTimePeriod"
    :label="$gettext('Time interval / Time of year')"
    :info-text="[infoDailyData]"
    :select-options="timePeriodOptions"></var-select>
    
    <var-select
    v-model="valueType"
    :label="$gettext('Value type')"
    :select-options="valueTypeOptions"></var-select>
    
    <var-select
    v-model="percentile"
    :label="$gettext('Ensemble percentile')"
    :info-text="[infoModelOutput, infoPercentile]"
    :select-options="percentileOptions"></var-select>
    
    <ssp-scenario
    v-show="showScenario"
    v-model="oapicScenario"
    :select-options="scenarioOptions"></ssp-scenario>
    
    
    <fieldset v-show="!pointClickOn">
      <legend v-translate>Date range</legend>
      
      <option-radio
      v-model="rangeType"
      :label="$gettext('Time range type')"
      :radio-inline="true"
      :radio-options="rangeTypeOptions"></option-radio>
      
      <div
      v-show="datesTooFarMsg" class="alert alert-warning">
      <p>
        {{ datesTooFarMsg }}
      </p>
    </div>
    
    <div id="historical-date-range" v-show="scenarioType === 'historical' && rangeType !=='P30Y-Avg'">
      <date-select
      v-model="dateHistStart"
      :label="$gettext('Historical start date')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :required="timePeriodIsMonthly"
      :min-date="dateConfigs.dateMin"
      :max-date="dateConfigs.dateMax"
      :custom-error-msg="dateRangeErrorMessage"
      :placeholder="dateConfigs.placeholder"></date-select>
      
      <date-select
      v-model="dateHistEnd"
      :label="$gettext('Historical end date')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :required="timePeriodIsMonthly"
      :min-date="dateConfigs.dateMin"
      :max-date="dateConfigs.dateMax"
      :custom-error-msg="dateRangeErrorMessage"
      :placeholder="dateConfigs.placeholder"></date-select>
      
      <button
      id="clear-hist-dates-btn"
      class="btn btn-default"
      type="button"
      @click="clearDates"
      v-translate>Clear dates</button>
    </div>
    <div id="ssp-date-range" v-show="scenarioType === 'projected' && rangeType !=='P30Y-Avg'">
      <date-select
      v-model="dateSspStart"
      :label="$gettext('Start date')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :required="timePeriodIsMonthly"
      :min-date="dateConfigs.dateMin"
      :max-date="dateConfigs.dateMax"
      :custom-error-msg="dateRangeErrorMessage"
      :placeholder="dateConfigs.placeholder"></date-select>
      
      <date-select
      v-model="dateSspEnd"
      :label="$gettext('End date')"
      :minimum-view="dateConfigs.minimumView"
      :format="dateConfigs.format"
      :required="timePeriodIsMonthly"
      :min-date="dateConfigs.dateMin"
      :max-date="dateConfigs.dateMax"
      :custom-error-msg="dateRangeErrorMessage"
      :placeholder="dateConfigs.placeholder"></date-select>
      
      <button
      id="clear-dates-btn"
      class="btn btn-default"
      type="button"
      @click="clearDates"
      v-translate>Clear dates</button>
    </div>
    
    <var-select
    v-show="rangeType === 'P30Y-Avg'"
    v-model="avg30Year"
    :label="$gettext('30-Year average range')"
    :select-options="avg30YearOptions"></var-select>
  </fieldset>
  
  <format-select-file
  class="mrgn-tp-md"
  v-show="!pointClickOn"
  v-model="oapicFormat"
  :formats="fileFormats"
  :info-text="[infoSupportDeskGridPoint]"></format-select-file>
  
  <data-download-box
  v-show="!pointClickOn"
  :file-name="filename"
  :file-format="oapicFormat"
  :download-url="oapicUrl"
  :download-context="downloadContext"
  :band-range-format="bandRangeFormat"
  :has-errors="hasErrors">
</data-download-box>

<more-resources></more-resources>
</section>
</template>

<script>
import { mapState } from "vuex"

import BBOXMap from '@/components/BBOXMap.vue'
import FormatSelectFile from '@/components/FormatSelectFile.vue'
import VarSelect from '@/components/VarSelect.vue'
import SSPScenarioSelect from '@/components/SSPScenarioSelect.vue'
import DateSelect from '@/components/DateSelect.vue'
import OptionRadio from '@/components/OptionRadio.vue'
import DataDownloadBox from '@/components/DataDownloadBox.vue'
import DataAccessDocLink from '@/components/DataAccessDocLink.vue'
import TipsUsingTool from '@/components/TipsUsingTool.vue'
import MoreResources from '@/components/MoreResources.vue'
import { oapiCoverage } from '@/components/mixins/oapi-coverages.js'
import { ows } from '@/components/mixins/ows.js'
import { datasets } from '@/components/mixins/datasets.js'
import { wps } from '@/components/mixins/wps.js'
import axios from 'axios'

export default {
  name: 'CanDCSU6Form',
  mixins: [oapiCoverage, ows, datasets, wps],
  components: {
    'bbox-map': BBOXMap,
    FormatSelectFile,
    VarSelect,
    'ssp-scenario' : SSPScenarioSelect,
    DateSelect,
    OptionRadio,
    DataDownloadBox,
    DataAccessDocLink,
    TipsUsingTool,
    MoreResources,
    
  },
  data() {
    return{
      dateSspStart: this.$moment.utc('2100-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateSspEnd: this.$moment.utc('2100-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateSspMin: this.$moment.utc('2015-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateSspMax: this.$moment.utc('2100-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistStart: this.$moment.utc('2014-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistEnd: this.$moment.utc('2014-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistMin: this.$moment.utc('1950-01-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      dateHistMax: this.$moment.utc('2014-12-01 00:00:00', 'YYYY-MM-DD HH:mm:ss').toDate(),
      mapBBOX: '-154,38,-49,81',
      oapicIdVariable: 'AirTemp',
      scenarioType: 'projected',
      oapicIdTimePeriod: 'annual',
      valueType: 'anomaly',
      percentile: '50',
      oapicScenario: 'SSP126',
      rangeType: 'P30Y-Avg',
      avg30Year: '2021-2050',
      percentileLink: {
        en: process.env.VUE_APP_CANADA_SERVER_EN + '/environment-climate-change/services/climate-change/canadian-centre-climate-services/basics/scenario-models.html#toc2',
        fr: process.env.VUE_APP_CANADA_SERVER_FR + '/environnement-changement-climatique/services/changements-climatiques/centre-canadien-services-climatiques/essentiels/scenarios-modeles.html#toc2'
      },
      showScenario: true,
      oapicIdDataset: 'candcsu6',
      last30Ytype: 'projected',
      
      // Extra variables for saving last selected months
      sspStartMonth: 1,
      sspEndMonth: 1,
      lastScenarioIsMonthly: false,
      sspPrevStartYear: '2100',
      sspPrevEndYear: '2100'
    }
  },
  watch: {
    rangeType: function (newVal){
      if(newVal === 'custom' && this.scenarioType === 'historical'){
        this.showScenario = false
      }else{
        this.showScenario = true
      }
      if(newVal === 'custom'){
        this.valueType = 'absolute'
      }else{
        if(this.scenarioType === 'projected'){
          this.valueType = 'anomaly'
          if(this.last30Ytype === 'historical'){
            this.avg30Year = '2021-2050'
            this.last30Ytype = 'projected'
          }  
        }else{
          if(this.last30Ytype === 'projected'){
            this.avg30Year = '1971-2000'
            this.last30Ytype = 'historical'
          }
        }
      }
    },
    scenarioType: function (newVal){
      if(newVal === 'historical' && this.rangeType === 'custom'){
        this.showScenario = false
      }else{
        this.showScenario = true
      }
      if(newVal === 'projected' && this.rangeType === 'P30Y-Avg'){
        this.valueType = 'anomaly'
      }else{
        this.valueType = 'absolute'
      }
      if(this.rangeType === 'P30Y-Avg'){
        if(newVal === 'projected' && this.last30Ytype === 'historical'){
          this.avg30Year = '2021-2050'
          this.last30Ytype = 'projected'
        }else if(newVal === 'historical' && this.last30Ytype === 'projected'){
          this.avg30Year = '1971-2000'
          this.last30Ytype = 'historical'
        }
      }
      
      // Check what value is when changing between historical and future data
      if(newVal === 'projected'){
        if(this.oapicIdTimePeriod === 'monthly' && this.dateAdjustHelper){
          // Need to add in the stored months
          if(this.dateIsString(this.dateSspStart) && (this.dateSspStart.slice(-3,) === '-01' || !this.dateSspStart.includes('-'))){
            this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').add(this.sspStartMonth-1, 'M').format(this.dateConfigs.format)
          }else{
            this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').format(this.dateConfigs.format)
          }
          if(this.dateIsString(this.dateSspEnd) && (this.dateSspEnd.slice(-3,) === '-01' || !this.dateSspEnd.includes('-'))){
            this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').add(this.sspEndMonth-1, 'M').format(this.dateConfigs.format)
          }else{
            this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').format(this.dateConfigs.format)
          }
        }
      }else{
        if(this.oapicIdTimePeriod === 'monthly' && this.dateAdjustHelper){
          this.sspStartMonth = Number(this.dateSspStart.slice(-2,))
          this.sspEndMonth = Number(this.dateSspEnd.slice(-2,))
        }
      }
    },
    
    oapicIdTimePeriod: function (newVal) {
      if (newVal === 'monthly') {
        this.valueType = 'absolute'
        this.rangeType = 'custom'
      }else{
        if(this.lastScenarioIsMonthly === true){
          // By this point, the dates should be stored as Strings
          if(this.scenarioType === 'projected' && this.dateAdjustHelper){
            this.sspStartMonth = Number(this.dateSspStart.slice(-2,))
            this.sspEndMonth = Number(this.dateSspEnd.slice(-2,))
            // Now store the last used year too
            this.sspPrevStartYear = this.dateSspStart.slice(0, 4)
            this.sspPrevEndYear = this.dateSspEnd.slice(0, 4)
          }
        }
        this.lastScenarioIsMonthly = false
      }

      if (this.dateAdjustHelper) {
        if(!this.dateIsString(this.dateSspStart)){
          this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').format(this.dateConfigs.format)
          this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').format(this.dateConfigs.format)
        }else if(newVal === 'monthly' && this.rangeType === 'custom'){
          if(this.scenarioType === 'projected'){
            if(this.dateSspStart.slice(-3,) === '-01' || this.lastScenarioIsMonthly !== true){
              this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').add(this.sspStartMonth-1, 'M').format(this.dateConfigs.format)
            }else{
              this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').format(this.dateConfigs.format)
            }
            if(this.dateSspEnd.slice(-3,) === '-01' || this.lastScenarioIsMonthly !== true){
              this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').add(this.sspEndMonth-1, 'M').format(this.dateConfigs.format)
            }else{
              this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').format(this.dateConfigs.format)
            }
          }
        }else{
          this.dateSspStart = this.formatDateToMoment(this.dateSspStart, 'sspStart').format(this.dateConfigs.format)
          this.dateSspEnd = this.formatDateToMoment(this.dateSspEnd, 'sspEnd').format(this.dateConfigs.format)
        }
      }

      if(newVal === 'monthly'){
        this.lastScenarioIsMonthly = true
      }
    },
    dateSspStart: function (){
      // When making a change in non-monthly projected data, reset the starting month
      if(this.scenarioType === 'projected' && this.oapicIdTimePeriod !== 'monthly' && this.sspPrevStartYear !== this.dateSspStart){
        this.sspStartMonth = 1
      }
    },
    dateSspEnd: function (){
      // When making a change in non-monthly projected data, reset the ending month
      if(this.scenarioType === 'projected' && this.oapicIdTimePeriod !== 'monthly' && this.sspPrevEndYear !== this.dateSspEnd){
        this.sspEndMonth = 1
      }
    }
  },
  methods: {
    getOapicParams: function () {
      // Use this to build the parameters for the URL
      let urlParams = []
      urlParams.push('f=' + this.oapicFormat)
      if(this.valueType === 'anomaly'){
        urlParams.push(`properties=${this.oapicIdVariable}Anomaly`)
      }else{
        urlParams.push(`properties=${this.oapicIdVariable}`)
      }
      
      // subset
      let subset = []
      
      // All options have percentile
      subset.push(`subset=percentile(${this.percentile})`)
      
      // Only historical that is not using 30 year ranges has scenarios options
      if(this.scenarioType !== 'historical' || this.rangeType === 'P30Y-Avg'){
        subset.push(`scenario("${this.oapicScenario}")`)
      }
      if(this.rangeType === 'P30Y-Avg' && this.scenarioType === 'projected'){
        subset.push(`P30Y-Avg("${this.avg30Year}")`)
      }
      if(this.oapicIdTimePeriod !== 'annual' && this.oapicIdTimePeriod !== 'monthly'){
        subset.push(`season("${this.oapicIdTimePeriod}")`)
      }
      urlParams.push(subset.join(','))
      
      // bbox
      this.splitBBOXString()
      urlParams.push(`bbox=${this.bbox_parts.min_x},${this.bbox_parts.min_y},${this.bbox_parts.max_x},${this.bbox_parts.max_y}`)
      
      // datetime
      if (this.rangeType !== 'P30Y-Avg' && !this.oapicDatetime.includes('Invalid date')) {
        urlParams.push(`datetime=${this.oapicDatetime}`)
      }
      return urlParams
    },
    
    dateIsString: function (date) {
      return typeof date === 'string'
    },
    formatDateToMoment: function (date, varType) {
      if (date === 'Invalid date' || date === '' || date === null || varType === null) {
        return null // invalid dates
      }
      return this.dateIsString(date) ? this.$moment.utc(date, this.dateConfigs.format) : this.$moment.utc(date)
    },
    clearDates: function () {
      if (this.scenarioType === 'projected') {
        this.dateSspStart = null
        this.dateSspEnd = null
      } else {
        this.dateHistStart = null
        this.dateHistEnd = null
      }
    }
  },
  computed: {
    ...mapState('map', [
    'clickLatLng'
    ]),
    downloadContext: function () {
      let context = []
      context.push(this.oapicIdDataset)
      context.push(this.variableOptions[this.oapicIdVariable])
      context.push(this.scenarioTypeOptions[this.scenarioType])
      context.push(this.timePeriodOptions[this.oapicIdTimePeriod])
      context.push(this.valueTypeOptions[this.valueType])
      context.push(this.percentileOptions[this.percentile])
      
      // Only historical that is not using 30 year ranges has scenarios options
      if(this.scenarioType !== 'historical' || this.rangeType === 'P30Y-Avg'){
        context.push(this.oapicScenario)
      }
      
      // P30Y-Avg
      if(this.rangeType === 'P30Y-Avg' && this.scenarioType === 'projected'){
        context.push(this.avg30Year)
      }
      
      if(this.rangeType !== 'P30Y-Avg' && !this.oapicDatetime.includes('Invalid date')){
        context.push(this.oapicDatetime)
      }
      return context
    },
    // Options for the different selectable forms and buttons
    variableOptions: function() {
      return {
        AirTemp: this.$gettext('Mean daily mean temperature'),
        AirTempMax: this.$gettext('Mean daily max temperature'),
        AirTempMin: this.$gettext('Mean daily min temperature'),
        Precip: this.$gettext('Total precipitation')
      }
    },
    scenarioTypeOptions: function () {
      return {
        projected: this.$gettext('Future'),
        historical: this.$gettext('Historical')
      }
    },
    seasonOptions: function () {
      return {
        MAM: this.$gettext('Spring (March-May)'),
        JJA: this.$gettext('Summer (June-August)'),
        SON: this.$gettext('Fall (September-November)'),
        DJF: this.$gettext('Winter (December-February)')
      }
    },
    timePeriodOptions: function () {
      return {
        ...this.seasonOptions,
        annual: this.$gettext('Annual'),
        monthly: this.$gettext('Monthly')
      }
    },
    valueTypeOptions: function () {
      if(this.rangeType === 'P30Y-Avg' && this.scenarioType === 'projected'){
        return {
          anomaly: this.$gettext('Anomaly values')
        }
      }
      return {
        absolute: this.$gettext('Actual values')
      }
    },
    percentileOptions: function () {
      return {
        10: this.$gettext('10th percentile'),
        50: this.$gettext('50th percentile'),
        90: this.$gettext('90th percentile'),
      }
    },
    scenarioOptions: function () {
      return {
        "SSP126": this.$gettext('SSP126'),
        "SSP245": this.$gettext('SSP245'),
        "SSP585": this.$gettext('SSP585')
      }
    },
    rangeTypeOptions: function () {
      if (this.oapicIdTimePeriod === 'monthly'){
        return {
          'custom': this.$gettext('User defined range')
        }
      }
      return {
        'P30Y-Avg': this.$gettext('30-Year average'),
        'custom': this.$gettext('User defined range')
      }
    },
    avg30YearOptions: function () {
      if(this.rangeType === 'P30Y-Avg' && this.scenarioType === 'projected'){
        return {
          '2021-2050': '2021-2050',
          '2041-2070': '2041-2070',
          '2071-2100': '2071-2100'
        }
      }
      return {
        '1971-2000': '1971-2000'
      }
    },
    
    oapicCoverageId: function () {
      return 'climate:' + this.oapicIdDataset + ':' + this.scenarioType + ':' + this.timePeriodType + ':' + this.oapicValueType
    },
    oapicDatetime: function () {
      return this.dateStartMoment.format(this.dateConfigs.format) + '/' + this.dateEndMoment.format(this.dateConfigs.format)
    },
    oapicValueType: function() {
      if (this.rangeType === 'P30Y-Avg') {
        return this.rangeType
      } else {
        return this.valueType
      }
    },
    timePeriodType: function () {
      if (['annual', 'monthly'].includes(this.oapicIdTimePeriod)) {
        return this.oapicIdTimePeriod
      } else {
        return 'seasonal'
      }
    },
    dateConfigs: function () {
      let dateMin = this.scenarioType === 'projected' ? this.dateSspMin : this.dateHistMin
      let dateMax = this.scenarioType === 'projected' ? this.dateSspMax : this.dateHistMax
      if (this.oapicIdTimePeriod === 'monthly') {
        return {
          minimumView: 'month',
          format: 'YYYY-MM',
          placeholder: 'YYYY-MM',
          dateMin: dateMin,
          dateMax: dateMax
        }
      } else {
        return {
          minimumView: 'year',
          format: 'YYYY',
          placeholder: 'YYYY',
          dateMin: dateMin,
          dateMax: dateMax
        }
      }
    },
    
    // Functions to deal with min greater than max date error.
    bandsInRange: function () {
      if (this.scenarioType === 'projected') {
        return this.checkDatesInRange(this.bandMoments.sspStart, this.bandMoments.sspEnd)
      } else { // history
        return this.checkDatesInRange(this.bandMoments.histStart, this.bandMoments.histEnd)
      }
    },
    bandStartIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
        return this.checkDateStartIsEmptyOnly(this.dateSspStart, this.dateSspEnd)
      } else { // history
        return this.checkDateStartIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandEndIsEmptyOnly: function () {
      if (this.scenarioType === 'projected') {
        return this.checkDateEndIsEmptyOnly(this.dateSspStart, this.dateSspEnd)
      } else { // history
        return this.checkDateEndIsEmptyOnly(this.dateHistStart, this.dateHistEnd)
      }
    },
    bandMoments: function () {
      return {
        sspStart: this.formatDateToMoment(this.dateSspStart, 'sspStart'),
        sspEnd: this.formatDateToMoment(this.dateSspEnd, 'sspEnd'),
        histStart: this.formatDateToMoment(this.dateHistStart, 'histStart'),
        histEnd: this.formatDateToMoment(this.dateHistEnd, 'histEnd')
      }
    },
    dateStartMoment: function () {
      if (this.scenarioType === 'projected') {
        return this.$moment.utc(this.bandMoments.sspStart)
      } else {
        return this.$moment.utc(this.bandMoments.histStart)
      }
    },
    dateEndMoment: function () {
      if (this.scenarioType === 'projected') {
        return this.$moment.utc(this.bandMoments.sspEnd)
      } else {
        return this.$moment.utc(this.bandMoments.histEnd)
      }
    },
    bandDatesFormatted: function () {
      return {
        sspStart: this.bandMoments.sspStart === null ? null : this.bandMoments.sspStart.format(this.dateConfigs.format),
        sspEnd: this.bandMoments.sspEnd === null ? null : this.bandMoments.sspEnd.format(this.dateConfigs.format),
        histStart: this.bandMoments.histStart === null ? null : this.bandMoments.histStart.format(this.dateConfigs.format),
        histEnd: this.bandMoments.histEnd === null ? null : this.bandMoments.histEnd.format(this.dateConfigs.format)
      }
    },
    bandsPastLimits: function () {
      let start = this.scenarioType === 'historical' ? this.bandMoments.histStart : this.bandMoments.sspStart
      let end = this.scenarioType === 'historical' ? this.bandMoments.histEnd : this.bandMoments.sspEnd
      
      if (start === null || end === null) {
        return false
      }
      
      let minimumView = this.dateConfigs.minimumView
      
      return start.isBefore(this.dateConfigs.dateMin, minimumView) ||
      start.isAfter(this.dateConfigs.dateMax, minimumView) ||
      end.isBefore(this.dateConfigs.dateMin, minimumView) ||
      end.isAfter(this.dateConfigs.dateMax, minimumView)
    },
    
    // Functions for defining info links
    infoPercentile: function () {
      return {
        text: this.$gettext('<a href="{link}" target="_blank">Learn more about percentiles</a>'),
        link: this.percentileLink
      }
    },
    infoSupportDeskModelOutput: function () {
      return {
        text: this.$gettext('<a href="{link}" target="_blank">Contact the Climate Services Support Desk</a> if you\'re interested in individual model output'),
        link: this.supportDeskLink
      }
    },
    infoModelOutput: function () {
      return {
        text: this.$gettext('Visit <a href="{link}" target="_blank">ClimateData.ca</a> to access individual model output'),
        link: this.climateDataLink
      }
    },
    infoDailyData: function () {
      return {
        text: this.$gettext('Visit <a href="{link}" target="_blank">ClimateData.ca</a> to access daily data'),
        link: this.climateDataLink
      }
    },
    
    hasErrors: function () {
      if (this.rangeType === 'P30Y-Avg') { // no date range checks for 30-year averages
        return false
      } else {
        return this.hasCommonBandErrors
      }
    },

    dateAdjustHelper: function () {
      // Checks if the current values for dateSspStart and dateSspEnd can be reformatted
      const invalidValues = [null, undefined, 'Invalid date', '']
      return !(invalidValues.includes(this.dateSspStart) || invalidValues.includes(this.dateSspEnd))
    },

    lotsOfDataWarning: function () {
      return this.$gettext('Current date selection contains a lot of data to process. Execution will be slow and data may not be able to be retrieved.')
    },
    datesTooFarMsg: function () {
      // Creates the warning when a lot of data would be processed and would potentially take
      // a long time to download. Returns false otherwise.
      if (this.rangeType === 'P30Y-Avg'){
        return false
      }if(this.oapicIdTimePeriod !== 'monthly'){
        // Get the difference in time between the start and end moments, then if it
        // is at least 10 years, put up the warning
        if(this.scenarioType === 'projected'){
          if ((this.bandMoments.sspStart === null && this.bandMoments.sspEnd === null) || (this.bandMoments.sspStart === undefined && this.bandMoments.sspEnd === undefined)) {
            return this.lotsOfDataWarning
          }
          if (this.bandMoments.sspStart === null || this.bandMoments.sspEnd === null || this.bandMoments.sspStart === undefined || this.bandMoments.sspEnd === undefined) {
            return false
          }
          var yearRange = this.bandMoments.sspEnd.diff(this.bandMoments.sspStart, 'years')
          if(yearRange+1 >= 10){
            return this.lotsOfDataWarning
          }
        }else{
          if ((this.bandMoments.histStart === null && this.bandMoments.histEnd === null) || (this.bandMoments.histStart === undefined && this.bandMoments.histEnd === undefined)) {
            return this.lotsOfDataWarning
          }
          if (this.bandMoments.histStart === null || this.bandMoments.histEnd === null || this.bandMoments.histStart === undefined || this.bandMoments.histEnd === undefined) {
            return false
          }
          yearRange = this.bandMoments.histEnd.diff(this.bandMoments.histStart, 'years')
          if(yearRange+1 >= 10){
            return this.lotsOfDataWarning
          }
        }
      }else{
        // Working with monthly data
        if(this.scenarioType === 'projected'){
          if ((this.bandMoments.sspStart === null && this.bandMoments.sspEnd === null) || (this.bandMoments.sspStart === undefined && this.bandMoments.sspEnd === undefined)) {
            return false
          }
          if (this.bandMoments.sspStart === null || this.bandMoments.sspEnd === null || this.bandMoments.sspStart === undefined || this.bandMoments.sspEnd === undefined) {
            return false
          }
          var monthRange = this.bandMoments.sspEnd.diff(this.bandMoments.sspStart, 'months')
          if(monthRange+1 >= 9){
            return this.lotsOfDataWarning
          }
        }else{
          if ((this.bandMoments.histStart === null && this.bandMoments.histEnd === null) || (this.bandMoments.histStart === undefined && this.bandMoments.histEnd === undefined)) {
            return false
          }
          if (this.bandMoments.histStart === null || this.bandMoments.histEnd === null || this.bandMoments.histStart === undefined || this.bandMoments.histEnd === undefined) {
            return false
          }
          monthRange = this.bandMoments.histEnd.diff(this.bandMoments.histStart, 'months')
          if(monthRange+1 >= 9){
            return this.lotsOfDataWarning
          }
        }
      }
      return false
    },
    candcsu6HistData: function () {
      return `${this.oapicServer}/collections/climate:candcsu6:historical:monthly:absolute?f=json`
    },
    candcsu6SspData: function () {
      return `${this.oapicServer}/collections/climate:candcsu6:projected:monthly:absolute?f=json`
    },
  },
  beforeMount(){
    let this_ = this
    // Set boundaries and initialize initial date values
    axios.get(this_.candcsu6HistData)
    .then(function (response) {
      const histDataBounds = response.data.extent.temporal.interval[0]
      this_.dateHistMin = this_.$moment.utc(`${histDataBounds[0]}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
      this_.dateHistMax = this_.$moment.utc(`${histDataBounds[1]}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
      this_.dateHistStart = this_.dateHistMax
      this_.dateHistEnd = this_.dateHistMax
    })
    axios.get(this_.candcsu6SspData)
    .then(function (response) {
      const sspDataBounds = response.data.extent.temporal.interval[0]
      this_.dateSspMin = this_.$moment.utc(`${sspDataBounds[0]}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
      this_.dateSspMax = this_.$moment.utc(`${sspDataBounds[1]}-01 00:00:00`, 'YYYY-MM-DD HH:mm:ss').toDate()
      this_.dateSspStart = this_.dateSspMax
      this_.dateSspEnd = this_.dateSspMax
    })
  }
}
</script>