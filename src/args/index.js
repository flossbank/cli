const help = require('./help')
const version = require('./version')
const auth = require('./auth')
const check = require('./check')
const install = require('./install')
const uninstall = require('./uninstall')
const wrap = require('./wrap')
const unwrap = require('./unwrap')
const update = require('./update')
const runlog = require('./runlog')

const supportedArgs = new Map([
  ['--help', help],
  ['help', help],

  ['--version', version],
  ['-v', version],
  ['version', version],

  ['auth', auth],
  ['check', check],
  ['install', install],
  ['uninstall', uninstall],
  ['wrap', wrap],
  ['unwrap', unwrap],
  ['update', update],
  ['runlog', runlog]
])

class Args {
  constructor ({ config, update, client, ui, alias, profile, env, runlog }) {
    this.deps = { config, update, client, ui, alias, profile, env, runlog }
    this._haveArgs = false
    const firstArg = process.argv[2]

    // handle no arg; display help msg
    if (!firstArg) {
      this.handler = help
      this._haveArgs = true
    } else if (supportedArgs.has(firstArg)) {
      this.handler = supportedArgs.get(firstArg)
      this._haveArgs = true
    }
  }

  haveArgs () {
    return this._haveArgs
  }

  async act () {
    if (typeof this.handler !== 'function') return
    let exitCode
    try {
      exitCode = await this.handler(this.deps, process.argv.slice(3))
    } catch (e) {
      this.deps.runlog.error(e)
      exitCode = 1
    }
    return exitCode
  }
}

module.exports = Args
