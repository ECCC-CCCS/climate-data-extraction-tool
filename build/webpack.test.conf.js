'use strict'
// This is the webpack config used for unit tests.
const utils = require('./utils')
const webpack = require('webpack')
const merge = require('webpack-merge')
const chalk = require('chalk')
const baseWebpackConfig = require('./webpack.base.conf')

const CONFIG_FILE = process.env.npm_config_config === undefined ? 'config/test.env.js' : process.env.npm_config_config

console.log(chalk.cyan('  Config file set to: ') + chalk.yellow(CONFIG_FILE) + '\n')

const webpackConfig = merge(baseWebpackConfig, {
  // use inline sourcemap for karma-sourcemap-loader
  module: {
    rules: utils.styleLoaders()
  },
  devtool: '#inline-source-map',
  resolveLoader: {
    alias: {
      // necessary to to make lang="scss" work in test when using vue-loader's ?inject option
      // see discussion at https://github.com/vuejs/vue-loader/issues/724
      'scss-loader': 'sass-loader'
    }
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': require('../' + CONFIG_FILE)
    })
  ]
})

// no need for app entry during tests
delete webpackConfig.entry

module.exports = webpackConfig
