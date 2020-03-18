const { spawn } = require('child_process')
const { supportsColor } = require('chalk')
const { SUPPORTED_PMS } = require('../constants')
const ci = require('ci-info')

class Pm {
  constructor ({ runlog }) {
    this.runlog = runlog
    this.pm = null
    this.pmArg = null
    this.pmCmd = null
  }

  async init () {
    // this takes the first arg (which should be the package manager)
    // and removes it from the argv (so the actual package manager has
    // a clean argv to parse)
    this.pmArg = process.argv.splice(2, 1).pop().toLowerCase()
    this.pmCmd = [this.pmArg, ...process.argv.slice(2)].join(' ')
    const supportedPm = SUPPORTED_PMS.includes(this.pmArg)
    this.supportedPm = supportedPm
    if (!supportedPm) { return { supportedPm } }
    this.pm = require(`./${this.pmArg}`)
    const self = this
    const noAdsPm = () => { self.runlog.write().then(() => { self.start({ silent: false }) }) }
    const adsPm = (cb) => { self.start({ silent: true }, cb) }
    return { supportedPm, adsPm, noAdsPm }
  }

  getPmCmd () {
    return this.pmCmd
  }

  shouldShowAds () {
    if (!this.supportedPm) return false
    if (!this._isDefined('isSupportedVerb')) return false

    const supportedVerb = this.pm.isSupportedVerb(this.pmCmd)
    if (this.runlog.enabled) { // allow ads in CI if in debug mode
      return supportedVerb
    }
    return supportedVerb && !ci.isCI
  }

  start (opts = {}, cb) {
    if (this._isDefined('start')) {
      return this.pm.start(opts, cb)
    }
    // default start
    if (!opts.silent) {
      return spawn(this.pmArg, process.argv.slice(2), { stdio: 'inherit', shell: true })
    }
    if (supportsColor) {
      process.env.FORCE_COLOR = 3
    }
    const child = spawn(this.pmArg, process.argv.slice(2), { shell: true })
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
    return typeof this.pm[fn] === 'function'
  }
}

module.exports = Pm
