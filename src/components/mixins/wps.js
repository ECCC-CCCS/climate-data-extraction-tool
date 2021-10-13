import { mapState } from "vuex"

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
    pointClickOn: function (newVal) {
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
    ...mapState('map', [
      'pointClickOn',
      'clickLatLng'
    ]),
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
