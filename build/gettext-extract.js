const { Extractor } = require('@kngai/vue-gettext-tools')

const extractorConfig = {verbose: true}

Extractor(extractorConfig, ['src/**/*.{vue,js}'], 'locales/po/dictionary.pot')
