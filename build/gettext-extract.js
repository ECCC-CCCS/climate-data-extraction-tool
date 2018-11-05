const { Extractor } = require('vue-gettext-tools')
const gettextOptions = require('../config/i18n')

const extractorConfig = {verbose: true}
const locales = gettextOptions.allLocales

Extractor(extractorConfig, ['src/**/*.{vue,js}'], 'locales/po/dictionary.pot')
