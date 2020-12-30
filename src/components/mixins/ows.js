import proj4 from 'proj4'

// Add supported projections
proj4.defs('EPSG:3978', '+proj=lcc +lat_1=49 +lat_2=77 +lat_0=49 +lon_0=-95 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs')
proj4.defs('EPSG:3857', '+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs')

/*
Anything common to OWS and web mapping configs
*/
export const ows = {
  data () {
    return {
      GEOMET_WEATHER_SERVER: process.env.VUE_APP_GEOMET_WEATHER_SERVER,
      OPENAPI_SERVER: process.env.VUE_APP_OPENAPI_SERVER,
      GEOMET_CLIMATE_SERVER: process.env.VUE_APP_GEOMET_CLIMATE_SERVER,
      WEB_SERVER: {
        en: process.env.VUE_APP_WEB_SERVER_EN,
        fr: process.env.VUE_APP_WEB_SERVER_FR
      },
      APP_PATH: {
        en: process.env.VUE_APP_PUBLIC_PATH_EN,
        fr: process.env.VUE_APP_PUBLIC_PATH_FR
      },
      ows_bbox: '-165,18,-20,87',
      ows_crs: 'EPSG:4326',
      bbox_parts: {
        min_x: 0,
        min_y: 0,
        max_x: 0,
        max_y: 0
      },
      toggleDetailsState: false,
      toggleDetailsAdvState: false
    }
  },
  methods: {
    toggleDetails: function () {
      this.toggleDetailsState = !this.toggleDetailsState
    },
    toggleDetailsAdv: function () {
      this.toggleDetailsAdvState = !this.toggleDetailsAdvState
    },
    langShort: function (langKey) {
      return langKey.substring(0, 2)
    },
    splitBBOXString: function () {
      let bboxSplit = this.ows_bbox.split(',')
      this.bbox_parts.min_x = parseFloat(bboxSplit[0])
      this.bbox_parts.min_y = parseFloat(bboxSplit[1])
      this.bbox_parts.max_x = parseFloat(bboxSplit[2])
      this.bbox_parts.max_y = parseFloat(bboxSplit[3])
    }
  },
  computed: {
    crsLabel: function () {
      return this.$gettext('Map Projection')
    },
    crsOptions: function () {
      return {
        'EPSG:4326': this.$gettext('World Geodetic System 1984 (EPSG:4326)'),
        'EPSG:3978': this.$gettext('Canada Atlas Lambert (EPSG:3978)'),
        'EPSG:3857': this.$gettext('Pseudo-Mercator (EPSG:3857)')
      }
    },
    wcs2_climate_url_base: function () {
      // complete url before layer & params
      return this.GEOMET_CLIMATE_SERVER + '?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage'
    },
    wcs2_weather_url_base: function () {
      return this.GEOMET_WEATHER_SERVER + '?SERVICE=WCS&VERSION=2.0.1&REQUEST=GetCoverage'
    },
    wfs3_url_base: function () {
      // complete url before layer & params
      return this.OPENAPI_SERVER +
        '/collections'
    },
    reprojected_bbox_parts: function () {
      let bottomLeft = [this.bbox_parts.min_x, this.bbox_parts.min_y]
      let topRight = [this.bbox_parts.max_x, this.bbox_parts.max_y]
      bottomLeft = proj4('EPSG:4326', this.ows_crs, bottomLeft)
      topRight = proj4('EPSG:4326', this.ows_crs, topRight)

      return {
        min_x: bottomLeft[0],
        min_y: bottomLeft[1],
        max_x: topRight[0],
        max_y: topRight[1]
      }
    }
  }
}
