const { Compiler } = require('vue-gettext-tools')
const gettextOptions = require('../config/i18n')

const compilerConfig = {verbose: true}
const locales = gettextOptions.allLocales

Compiler(compilerConfig, 'locales/po/dictionary.pot', 'locales/po/', 'locales/json/', locales)
