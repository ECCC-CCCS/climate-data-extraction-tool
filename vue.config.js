const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackAutoInject = require('webpack-auto-inject-version')

module.exports = {
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
        webtrends: '/webtrends/scripts/webtrends.load.js', // include webtrends script for OPS only
        minify: {
          removeComments: false
        }
      }),

      // Auto inject version
      new WebpackAutoInject({ // Node deprecation warning on build
        SILENT: true,
        // options
        components: {
          AutoIncreaseVersion: false,
          InjectAsComment: false
        },
        componentsOptions: {
          InjectByTag: {
            // https://www.npmjs.com/package/dateformat
            dateFormat: 'isoUtcDateTime'
          }
        }
      })
    ]
  }
}
