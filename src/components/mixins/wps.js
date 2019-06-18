/*
Anything common to wps setup; works in conjunction with wcs mixin data()
*/
export const wps = {
  data () {
    return {
      wps_format: 'csv'
    }
  },
  watch: {
    pointDownloadOn: function (newVal) {
      if (newVal === true) {
        this.rangeType = 'custom'
        if (this.wcs_id_timePeriod === 'ENS') { // DCS, CMIP5
          this.wcs_id_timePeriod = 'YEAR'
        }
        if (this.wcs_id_cangrdType === 'TREND') {
          this.wcs_id_cangrdType = 'ANO'
        }
      }
    }
  },
  computed: {
    titlePointDownload: function () {
      return this.$pgettext('Title heading', 'Single grid point download')
    },
    invalidPointDownloadInputs: function () {
      if (this.clickLatLng === null) {
        return true
      } else {
        return false
      }
    },
    pointDownloadOn: function () {
      return this.$store.getters.getPointClickStatus === 'on'
    },
    clickLatLng: function () {
      return this.$store.getters.getClickLatLng
    },
    pointInputs: function () {
      return {
        layer: this.wcs_coverage_id,
        y: this.clickLatLng === null ? null : this.clickLatLng.lat,
        x: this.clickLatLng === null ? null : this.clickLatLng.lng,
        format: this.wps_format
      }
    }
  }
}
