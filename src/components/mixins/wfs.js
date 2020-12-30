/*
Anything common to WFS query UI goes here with default values provided in data()
*/
export const wfs = {
  data () {
    return {
      wfs_format: 'csv',
      bbox_parts: {
        min_x: 0,
        min_y: 0,
        max_x: 0,
        max_y: 0
      },
      wfs_province: 'null',
      wfs_layer: null,
      wfs_layer_station: null,
      wfs_selected_station_ids: [],
      wfs_station_limit: 10000,
      wfs_limit: 150000,
      wfs_max_limit: 1000000,
      wfs_min_limit: 1,
      date_start: null,
      date_end: null,
      mapMaxZoom: 12,
      datasetToStnColName: { // Unique primary ID of MSC climate stations
        ahccd: 'station_id__id_station',
        hydrometric: 'STATION_NUMBER',
        normals: 'CLIMATE_IDENTIFIER',
        daily: 'CLIMATE_IDENTIFIER',
        monthly: 'CLIMATE_IDENTIFIER',
        ltce: 'VIRTUAL_CLIMATE_ID'
      },
      datasetToNameColName: {
        ahccd: 'station_name__nom_station',
        hydrometric: 'STATION_NAME',
        normals: 'STATION_NAME',
        daily: 'STATION_NAME',
        monthly: 'STATION_NAME',
        ltce: 'ENG_STN_NAME' // Switch on locale change
      },
      datasetToDateColName: {
        hydrometric: 'DATE', // MAX_DATE for hydrometric-annual-statistics
        normals: 'MONTH',
        daily: 'LOCAL_DATE',
        monthly: 'LOCAL_DATE',
        ltce: 'END_DATE'
      },
      datasetToProvColName: {
        ahccd: 'province__province',
        hydrometric: 'PROV_TERR_STATE_LOC',
        normals: 'PROVINCE_CODE',
        daily: 'PROVINCE_CODE',
        monthly: 'PROVINCE_CODE',
        ltce: 'PROVINCECODE'
      },
      layerToColSortOrder: { // default download sort order
        'climate-normals': ['CLIMATE_IDENTIFIER', 'NORMAL_ID', 'MONTH'],
        'hydrometric-daily-mean': ['IDENTIFIER'],
        'hydrometric-monthly-mean': ['IDENTIFIER'],
        'hydrometric-annual-peaks': ['IDENTIFIER'],
        'hydrometric-annual-statistics': ['IDENTIFIER'],
        'ahccd-monthly': ['identifier__identifiant'],
        'ahccd-annual': ['identifier__identifiant'],
        'ahccd-seasonal': ['identifier__identifiant'],
        'ahccd-trends': ['identifier__identifiant'],
        'ltce-temperature': ['IDENTIFIER'],
        'ltce-precipitation': ['IDENTIFIER'],
        'ltce-snowfall': ['IDENTIFIER']
      }
    }
  },
  beforeMount () {
    // reset existing selections that share with other components
    this.$store.dispatch('changeProvince', 'null') // to share with bbox
  },
  computed: {
    getProvince: function () {
      return this.$store.getters.getProvince
    },
    stationProvCol: function () { // province column for station table
      const routeName = this.$route.name
      const climateStationSets = ['monthly', 'daily', 'normals']
      if (climateStationSets.indexOf(routeName) !== -1) {
        return 'PROV_STATE_TERR_CODE'
      } else {
        return this.datasetToProvColName[routeName]
      }
    },
    stnPrimaryId: function () {
      return this.datasetToStnColName[this.$route.name]
    },
    dateConfigs: function () {
      if (this.wfs_layer === 'climate-monthly') {
        return {
          minimumView: 'month',
          format: 'YYYY-MM',
          placeholder: 'YYYY-MM'
        }
      } else {
        return {
          minimumView: 'day',
          format: 'YYYY-MM-DD',
          placeholder: 'YYYY-MM-DD'
        }
      }
    },
    dateMoment: function () {
      return {
        min: this.$moment.utc(this.date_min),
        max: this.$moment.utc(this.date_max)
      }
    },
    dateStartEmpty: function () {
      return this.date_start === null || this.date_start === 'Invalid date'
    },
    dateEndEmpty: function () {
      return this.date_end === null || this.date_end === 'Invalid date'
    },
    dateRangeHasNull: function () {
      return this.dateStartEmpty || this.dateEndEmpty
    },
    dateStartIsEmptyOnly: function () {
      if (this.dateStartEmpty && !this.dateEndEmpty) {
        return true
      } else {
        return false
      }
    },
    dateEndIsEmptyOnly: function () {
      if (this.dateEndEmpty && !this.dateStartEmpty) {
        return true
      } else {
        return false
      }
    },
    dateRangeErrorMessage: function () {
      if (this.dateStartIsEmptyOnly || this.dateEndIsEmptyOnly) {
        return this.$gettext('Date range fields must be all set or cleared.')
      }
      if (this.dateRangeHasBadRange) {
        return this.$gettext('The start date cannot be greater than the end date.')
      }
      return '' // no errors
    },
    temporal: function () {
      if (this.dateRangeIsValid) {
        if (this.hasInvalidMomentDate) {
          return null
        } else {
          let format = this.dateConfigs.format
          let start = this.$moment.utc(this.date_start).format(format)
          let end = this.$moment.utc(this.date_end).format(format)
          if (this.wfs_layer === 'climate-daily') {
            // format = 'YYYY-MM-DD HH:mm:ss'
            start += ' 00:00:00'
            end += ' 00:00:00'
          }
          return 'datetime=' + start + '/' + end
        }
      } else {
        return null
      }
    },
    hasInvalidMomentDate: function () {
      let format = this.dateConfigs.format
      let start = this.$moment.utc(this.date_start, format).format(format)
      let end = this.$moment.utc(this.date_end, format).format(format)

      return (start === 'Invalid date' || end === 'Invalid date')
    },
    dateRangeIsValid: function () {
      if (this.hasInvalidMomentDate) {
        return false
      } else if (this.dateRangeHasNull) { // Date range is valid enough to generate a date range string
        return false
      } else {
        return true
      }
    },
    datesCleared: function () {
      return this.dateStartEmpty && this.dateEndEmpty
    },
    dateRangeHasBadRange: function () {
      if (this.datesCleared) { // don't determine bad range if dates are cleared
        return false
      } else if (this.$moment.utc(this.date_end, this.dateConfigs.format).format('YYYY-MM-DD') <= this.$moment.utc(this.date_start, this.dateConfigs.format).format('YYYY-MM-DD')) {
        return true
      } else {
        return false
      }
    },
    dateRangePastLimits: function () {
      let start = this.$moment.utc(this.date_start)
      let end = this.$moment.utc(this.date_end)
      let minimumView = this.dateConfigs.minimumView

      return start.isBefore(this.date_min, minimumView) ||
        start.isAfter(this.date_max, minimumView) ||
        end.isBefore(this.date_min, minimumView) ||
        end.isAfter(this.date_max, minimumView)
    },
    hasErrors: function () {
      return this.dateRangeHasBadRange ||
        this.dateRangePastLimits ||
        this.dateStartIsEmptyOnly ||
        this.dateEndIsEmptyOnly ||
        this.noProvinceStationSelected
    },
    spatialSelectPriority: function () {
      // Determines spatial selection priority: point, province, bbox
      if (this.wfs_province !== 'null') {
        return 'province'
      } else if (this.wfs_selected_station_ids.length > 0) {
        return 'station'
      } else if (this.ows_bbox !== null) {
        return 'bbox'
      } else {
        return true
      }
    },
    stationsSelected: function () {
      return this.wfs_selected_station_ids.length > 0
    },
    provinceSelected: function () {
      return this.wfs_province !== 'null'
    },
    noProvinceStationSelected: function () {
      return !this.stationsSelected && !this.provinceSelected && this.$store.getters.getBboxStationsTotal === 0
    },
    layer_options: function () {
      let layers = {}
      layers[this.wfs_layer] = this.currentRouteTitle
      return layers
    }
  },
  methods: {
    splitBBOXString: function () {
      let bboxSplit = this.ows_bbox.split(',')
      this.bbox_parts.min_x = bboxSplit[0]
      this.bbox_parts.min_y = bboxSplit[1]
      this.bbox_parts.max_x = bboxSplit[2]
      this.bbox_parts.max_y = bboxSplit[3]
    },
    generateWFSBBOXParam: function () {
      return '&BBOX=' + this.ows_bbox
    },
    clearDates: function () {
      this.date_start = null
      this.date_end = null
    },
    getWFS3CommonParams: function (layerName) {
      let urlParams = []

      if (typeof layerName === 'undefined') {
        layerName = this.wfs_layer
      }

      // temporal
      if (this.temporal !== null) {
        urlParams.push(this.temporal)
      }

      let stnColName = this.datasetToStnColName[this.$route.name]
      let provColName = this.datasetToProvColName[this.$route.name]

      // Spatial selection priority: station, province, bbox
      switch (this.spatialSelectPriority) {
        case 'station':
          urlParams.push(stnColName + '=' + this.wfs_selected_station_ids.join('|'))
          break
        case 'province':
          urlParams.push(provColName + '=' + this.wfs_province)
          break
        case 'bbox':
          urlParams.push('bbox=' + this.ows_bbox)
          break
        default:
          // No spatial query applied
      }

      // sort
      let dateColName = this.datasetToDateColName[this.$route.name]
      let sortOrder = [provColName]

      // Special case for specific layers
      if (Object.prototype.hasOwnProperty.call(this.layerToColSortOrder, layerName)) {
        if (layerName.includes('ltce')) {
          sortOrder = this.layerToColSortOrder[layerName]
        } else {
          sortOrder = sortOrder.concat(this.layerToColSortOrder[layerName])
        }

      } else {
        sortOrder = sortOrder.concat([stnColName, dateColName])
      }

      urlParams.push('sortby=' + sortOrder.join(','))

      return urlParams
    },
    getWFS3CommonURL: function (layerName) {
      let url = this.wfs3_url_base
      url += '/' + layerName
      url += '/items?'

      let urlParams = this.getWFS3CommonParams(layerName)

      url += urlParams.join('&')

      return url
    },
    wfs3_download_url: function (layerName) {
      let url = this.wfs3_url_base
      url += '/' + layerName
      url += '/items?'

      let urlParams = this.getWFS3CommonParams(layerName)

      // Limit validation
      if (this.wfs_limit >= this.wfs_min_limit && this.wfs_limit <= this.wfs_max_limit) {
        if (this.wfs_limit !== '') {
          urlParams.push('limit=' + this.wfs_limit)
        }
      }

      // format selection
      if (this.wfs_format !== 'geojson') { // default is geoJSON
        urlParams.push('f=' + this.wfs_format)
      }

      url += urlParams.join('&')
      return url
    }
  }
}
