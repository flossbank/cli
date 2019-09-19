const log = require('npmlog')
log.pause() // will be unpaused when config is loaded.

const npm = require('npm/lib/npm.js')
const npmconf = require('npm/lib/config/core.js')
const errorHandler = require('npm/lib/utils/error-handler.js')
const nopt = require('nopt')

const { defs } = npmconf
const { shorthands, types } = defs
const conf = nopt(types, shorthands)

module.exports = () => {
  npm.argv = conf.argv.remain
  if (npm.deref(npm.argv[0])) npm.command = npm.argv.shift()
  else conf.usage = true

  process.on('uncaughtException', errorHandler)
  process.on('unhandledRejection', errorHandler)

  if (conf.usage && npm.command !== 'help') {
    npm.argv.unshift(npm.command)
    npm.command = 'help'
  }

  conf._exit = true

  npm.load(conf, function (er) {
    if (er) return errorHandler(er)
    npm.commands[npm.command](npm.argv, () => {
      errorHandler.apply(this, arguments)
    })
  })
}
