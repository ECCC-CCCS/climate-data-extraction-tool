'use strict'
const merge = require('webpack-merge')
const defaultEnv = require('./default.env')

// Config for: npm run dev
module.exports = merge(defaultEnv, { // merge with defaultEnv
  NODE_ENV: '"development"',
  WEB_SERVER_EN: '"http://localhost:8080"',
  WEB_SERVER_FR: '"http://localhost:8080"',
  APP_PATH_EN: '"/"',
  APP_PATH_FR: '"/"'
})
