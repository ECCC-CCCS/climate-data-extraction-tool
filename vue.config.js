const HtmlWebpackPlugin = require('html-webpack-plugin')
const { version } = require('./package.json')

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  publicPath: process.env.NODE_ENV === 'production'
    ? process.env.VUE_APP_PUBLIC_PATH_EN
    : '/',

  configureWebpack: {
    plugins: [
      // index.html customization
      new HtmlWebpackPlugin({
        template: 'public/index.html',
        filename: 'index.html',
        inject: true,
        deploy: process.env.VUE_APP_DEPLOY,
        version: version,
        webtrends: '/webtrends/scripts/webtrends.load.js', // include webtrends script for OPS only
        minify: {
          removeComments: false
        }
      })
    ]
  }
})
