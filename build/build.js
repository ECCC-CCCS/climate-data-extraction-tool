'use strict'
require('./check-versions')()

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const fs = require('fs')
const glob = require ('glob')

process.env.NODE_ENV = 'production'
switch (process.env.npm_config_env) {
  case 'test':
    process.env.NODE_ENV = 'testing'
    break
}

console.log(chalk.cyan('  Node environment set for: ' + process.env.NODE_ENV + '\n'))

if (process.env.npm_config_config === undefined) {
  console.log(chalk.red('  Build requires config file passed in.\n') +
    chalk.yellow('    example: npm run build --config=config/default.env.js\n'))
  console.log(chalk.cyan('  Build stopped.\n'))
  process.exit(1)
}

const config = require('../config')
const webpackConfig = require('./webpack.prod.conf')

const spinner = ora('building for deployment...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, (err, stats) => {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  Build failed with errors.\n'))
      process.exit(1)
    }

    var regexPathPattern = /"[\w]{1}:[/\\]*[/\w\\\-\.]*"/gi

    // Regex string replacements in app*.js
    glob("dist/static/js/app.*.js", function (er, files) {
      for (var i in files) {
        var pathToFile = files[i]
        fs.readFile(pathToFile, 'utf8', function (err, data) {
          if (err) {
            return console.log(err)
          }

          // Removes "C:\\Users\\UserName\\Path\\To\\app" or "C:/Users/Name/Path/To/App"
          console.log(chalk.yellow('  [' + pathToFile + '] Finding and removing all local directory strings...'))
          if (data.search(regexPathPattern) !== -1) {
            console.log(chalk.blue('    Found at index: ' + data.search(regexPathPattern) + '\n'))
          } else {
            console.log(chalk.green('   None found.\n'))
          }
          var result = data.replace(regexPathPattern, '"cccs-omitted"')

          fs.writeFile(pathToFile, result, 'utf8', function (err) {
             if (err) return console.log(err)
          })
        })
      }
    })

    // Regex string replacements in app*.js.map
    glob("dist/static/js/app.*.js.map", function (er, files) {
      for (var i in files) {
        var pathToFile = files[i]
        fs.readFile(pathToFile, 'utf8', function (err, data) {
          if (err) {
            return console.log(err)
          }

          // Removes "C:\\Users\\UserName\\Path\\To\\app" or "C:/Users/Name/Path/To/App"
          console.log(chalk.yellow('  [' + pathToFile + '] Finding and removing all local directory strings...'))
          if (data.search(regexPathPattern) !== -1) {
            console.log(chalk.blue('    Found at index: ' + data.search(regexPathPattern) + '\n'))
          } else {
            console.log(chalk.green('   None found.\n'))
          }
          var result = data.replace(regexPathPattern, '"cccs-omitted"')

          fs.writeFile(pathToFile, result, 'utf8', function (err) {
             if (err) return console.log(err)
          })
        })
      }
    })

    console.log(chalk.cyan('  Build complete.\n'))
    console.log(chalk.yellow(
      '  Tip: built files are meant to be served over an HTTP server.\n' +
      '  Opening index.html over file:// won\'t work.\n'
    ))
  })
})
