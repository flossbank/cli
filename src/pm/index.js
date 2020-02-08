const { SUPPORTED_PMS } = require('../constants')
const ci = require('ci-info')

function Pm () {
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

  const noAdsPm = (cb) => self.pm.start({ silent: false }, cb)
  const adsPm = (cb) => { self.pm.start({ silent: true }, cb) }

  return { supportedPm, adsPm, noAdsPm }
}

Pm.prototype.getPmCmd = function getPmCmd () {
  return this.pmCmd
}

Pm.prototype.shouldShowAds = function shouldShowAds () {
  if (!this.supportedPm) return false
  return this.pm.isSupportedVerb(this.pmCmd) && !ci.isCI
}

Pm.prototype.getTopLevelPackages = async function getTopLevelPackages () {
  return this.pm.getTopLevelPackages()
}

Pm.prototype.getRegistry = async function getRegistry () {
  return new Promise((resolve, reject) => {
    this.pm.getRegistry((e, stdout) => {
      if (e) return reject(e)
      if (!stdout) return reject(new Error('failed to determine registry'))
      return resolve(stdout.trim())
    })
  })
}

Pm.prototype.getLanguage = async function getLanguage () {
  return this.pm.getLanguage()
}

module.exports = Pm
