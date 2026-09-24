// const HtmlWebpackPlugin = require('html-webpack-plugin')
const { version } = require('./package.json')
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? process.env.VUE_APP_PUBLIC_PATH_EN
    : '/',

  configureWebpack: {
    performance: {
      maxEntrypointSize: 1024000, // 1 MB
      maxAssetSize: 1024000 // 1 MB
    },
    ignoreWarnings: [
      { message: /export 'default' \(imported as 'style\d+'\) was not found/ }
    ]
  },

  chainWebpack: config => {
    config.plugin('html').tap(args => {
      const options = args[0]
      options.deploy = process.env.VUE_APP_DEPLOY
      options.version = version
      options.webtrends = '/webtrends/scripts/webtrends.load.js'
      return args
    })
  }
})
