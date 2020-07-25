const { spawn } = require('child_process')
const Npm = require('./npm')
const Yarn = require('./yarn')

class Pm {
  constructor ({ runlog }) {
    this.supportedPms = {
      npm: (args) => new Npm(args),
      yarn: (args) => new Yarn(args)
    }
    this.runlog = runlog

    const args = process.argv.slice(2)
    this.packageManager = args[0]
    this.packageManagerArgs = args.slice(1)
    this.packageManagerCommand = args.join(' ')

    runlog.record(runlog.keys.PM_CMD, this.packageManagerCommand)

    this.supportedPm = typeof this.supportedPms[this.packageManager] !== 'undefined'
    this.runlog.record(this.runlog.keys.SUPPORTED_PM, this.supportedPm)

    if (this.supportedPm) {
      this.pm = this.supportedPms[this.packageManager](process.argv.slice(1))
    }
  }

  getPmCmd () {
    return this.packageManagerCommand
  }

  isSupportedPm () {
    return this.supportedPm
  }

  getSupportedPms () {
    return Object.keys(this.supportedPms)
  }

  isQuietMode () {
    if (this._isDefined('isQuietMode')) {
      return this.pm.isQuietMode()
    }
    const args = this.pm.args || {}
    return args.silent || args.quiet
  }

  isSupportedVerb () {
    if (this._isDefined('isSupportedVerb')) {
      return this.pm.isSupportedVerb()
    }
    return false
  }

  passthrough (cb = () => {}) {
    if (this._isDefined('passthrough')) {
      return this.pm.passthrough(cb)
    }
    // wrap passthrough args in quotes in case the child PM is also passing through
    const args = [joinArgs(this.packageManagerArgs)]
    const child = spawn(this.packageManager, args, {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR || 1 }
    })
    child.on('error', (err) => cb(err, 1))
    child.on('exit', (code) => cb(null, code))
  }

  start (cb = () => {}) {
    if (this._isDefined('start')) {
      return this.pm.start(cb)
    }
    const child = spawn(this.packageManager, this.packageManagerArgs, {
      shell: true,
      env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR || 1 }
    })
    child.on('error', (err) => cb(err))
    child.on('exit', (code) => cb(null, { exit: true, code }))
    child.stdout.on('data', (chunk) => cb(null, { stdout: chunk }))
    child.stderr.on('data', (chunk) => cb(null, { stderr: chunk }))
  }

  async getTopLevelPackages () {
    if (this._isDefined('getTopLevelPackages')) {
      try {
        const tlp = await this.pm.getTopLevelPackages()
        return tlp
      } catch (e) {
        this.runlog.error('failed to get top level packages %O', e)
      }
    }
    // default getTopLevelPackages
    return []
  }

  async getRegistry () {
    if (this._isDefined('getRegistry')) {
      try {
        const registry = await this.pm.getRegistry()
        return registry
      } catch (e) {
        this.runlog.error('failed to get registry %O', e)
      }
    }
    // default getRegistry
    return null
  }

  async getLanguage () {
    if (this._isDefined('getLanguage')) {
      try {
        const language = await this.pm.getLanguage()
        return language
      } catch (e) {
        this.runlog.error('failed to get language %O', e)
      }
    }
    // default getLanguage
    return null
  }

  async getVersion () {
    if (this._isDefined('getVersion')) {
      try {
        const version = await this.pm.getVersion()
        return version
      } catch (e) {
        this.runlog.error('failed to get pm version %O', e)
      }
    }
    // default getVersion
    return null
  }

  _isDefined (fn) {
    return this.pm && typeof this.pm[fn] === 'function'
  }
}

function joinArgs (args) {
  let joinedArgs = ''
  args.forEach((arg) => {
    joinedArgs += ' "' + arg.replace(/"/g, '\\"') + '"'
  })
  return joinedArgs
}

module.exports = Pm
