import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home'
import NotFound from '@/components/404'
import AHCCDForm from '@/components/AHCCDForm'
import CanGRDForm from '@/components/CanGRDForm'
import CanSIPSForm from '@/components/CanSIPSForm'
import CaPAForm from '@/components/CaPAForm'
import DCSForm from '@/components/DCSForm'
import CMIP5Form from '@/components/CMIP5Form'
import HydrometricArchiveForm from '@/components/HydrometricArchiveForm'
import ClimateNormalsForm from '@/components/ClimateNormalsForm'
import ClimateDailyForm from '@/components/ClimateDailyForm'
import ClimateMonthlyForm from '@/components/ClimateMonthlyForm'

Vue.use(Router)

const datasetPaths = {
  ahccd: {
    en: '/adjusted-station-data',
    fr: '/donnees-climatiques-ajustees'
  },
  normals: {
    en: '/climate-normals',
    fr: '/normales-climatiques'
  },
  daily: {
    en: '/daily-climate-data',
    fr: '/donnees-climatiques-quotidennes'
  },
  monthly: {
    en: '/monthly-climate-summaries',
    fr: '/sommaires-climatiques-mensuels'
  },
  cansips: {
    en: '/seasonal-forecasts',
    fr: '/previsions-saisonnieres'
  },
  capa: {
    en: '/regional-deterministic-precipitation-analysis',
    fr: '/analyse-regionale-deterministe-precipitation'
  },
  cangrd: {
    en: '/historical-gridded-data',
    fr: '/donnees-maillees-historiques'
  },
  cmip5: {
    en: '/cmip5-data',
    fr: '/simulations-cmip5'
  },
  dcs: {
    en: '/downscaled-data',
    fr: '/donnees-echelle-reduite'
  },
  hydrometric: {
    en: '/water-quantity-data',
    fr: '/donnees-quantite-eau'
  }
}

export default new Router({
  // Order matters for DatasetMenu.vue
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: {
        datasetSectionMenu: false
      }
    },
    {
      path: datasetPaths.cmip5.en,
      alias: datasetPaths.cmip5.fr,
      name: 'cmip5',
      component: CMIP5Form,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.cmip5.en,
        fr_path: datasetPaths.cmip5.fr,
        group: 'projection'
      }
    },
    {
      path: datasetPaths.dcs.en,
      alias: datasetPaths.dcs.fr,
      name: 'dcs',
      component: DCSForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.dcs.en,
        fr_path: datasetPaths.dcs.fr,
        group: 'projection'
      }
    },
    {
      path: datasetPaths.normals.en,
      alias: datasetPaths.normals.fr,
      name: 'normals',
      component: ClimateNormalsForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.normals.en,
        fr_path: datasetPaths.normals.fr,
        group: 'station'
      }
    },
    {
      path: datasetPaths.monthly.en,
      alias: datasetPaths.monthly.fr,
      name: 'monthly',
      component: ClimateMonthlyForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.monthly.en,
        fr_path: datasetPaths.monthly.fr,
        group: 'station'
      }
    },
    {
      path: datasetPaths.daily.en,
      alias: datasetPaths.daily.fr,
      name: 'daily',
      component: ClimateDailyForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.daily.en,
        fr_path: datasetPaths.daily.fr,
        group: 'station'
      }
    },
    {
      path: datasetPaths.hydrometric.en,
      alias: datasetPaths.hydrometric.fr,
      name: 'hydrometric',
      component: HydrometricArchiveForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.hydrometric.en,
        fr_path: datasetPaths.hydrometric.fr,
        group: 'station'
      }
    },
    {
      path: datasetPaths.ahccd.en,
      alias: datasetPaths.ahccd.fr,
      name: 'ahccd',
      component: AHCCDForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.ahccd.en,
        fr_path: datasetPaths.ahccd.fr,
        group: 'station'
      }
    },
    {
      path: datasetPaths.capa.en,
      alias: datasetPaths.capa.fr,
      name: 'capa',
      component: CaPAForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.capa.en,
        fr_path: datasetPaths.capa.fr,
        group: 'gridded'
      }
    },
    {
      path: datasetPaths.cangrd.en,
      alias: datasetPaths.cangrd.fr,
      name: 'cangrd',
      component: CanGRDForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.cangrd.en,
        fr_path: datasetPaths.cangrd.fr,
        group: 'gridded'
      }
    },
    {
      path: datasetPaths.cansips.en,
      alias: datasetPaths.cansips.fr,
      name: 'cansips',
      component: CanSIPSForm,
      meta: {
        datasetSectionMenu: true,
        en_path: datasetPaths.cansips.en,
        fr_path: datasetPaths.cansips.fr,
        group: 'gridded'
      }
    },
    {
      path: '*',
      name: '404',
      component: NotFound,
      meta: {
        datasetSectionMenu: false
      }
    }
  ]
})
