const { SUPPORTED_PMS } = require('../constants')
const ci = require('ci-info')

function Pm ({ runlog }) {
  this.runlog = runlog
  this.pm = null
  this.pmCmd = null
}

Pm.prototype.init = async function init () {
  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pmArg = process.argv.splice(2, 1).pop()
  this.pmCmd = [pmArg, ...process.argv.slice(2)].join(' ')

  const supportedPm = SUPPORTED_PMS.includes(pmArg)
  this.supportedPm = supportedPm
  if (!supportedPm) return { supportedPm }

  this.pm = require(`./${pmArg}`)

  const self = this

  const noAdsPm = () => {
    this.runlog.write().then(() => {
      self.pm.start({ silent: false })
    })
  }
  const adsPm = (cb) => { self.pm.start({ silent: true }, cb) }

  return { supportedPm, adsPm, noAdsPm }
}

Pm.prototype.getPmCmd = function getPmCmd () {
  return this.pmCmd
}

Pm.prototype.shouldShowAds = function shouldShowAds () {
  if (!this.supportedPm) return false
  const supportedVerb = this.pm.isSupportedVerb(this.pmCmd)
  if (this.runlog.enabled) { // allow ads in CI if in debug mode
    return supportedVerb
  }
  return supportedVerb && !ci.isCI
}

Pm.prototype.getTopLevelPackages = async function getTopLevelPackages () {
  try {
    const tlp = await this.pm.getTopLevelPackages()
    return tlp
  } catch (e) {
    this.runlog.error('failed to get top level packages %O', e)
    return []
  }
}

Pm.prototype.getRegistry = async function getRegistry () {
  try {
    const registry = await this.pm.getRegistry()
    return registry
  } catch (e) {
    this.runlog.error('failed to get registry %O', e)
    return null
  }
}

Pm.prototype.getLanguage = async function getLanguage () {
  try {
    const language = await this.pm.getLanguage()
    return language
  } catch (e) {
    this.runlog.error('failed to get language %O', e)
    return null
  }
}

Pm.prototype.getVersion = async function getVersion () {
  try {
    const version = await this.pm.getVersion()
    return version
  } catch (e) {
    this.runlog.error('failed to get pm version %O', e)
    return null
  }
}

module.exports = Pm
