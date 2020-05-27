const Conf = require('conf')
const path = require('path')
const {
  PROJECT_NAME,
  DEFAULT_API_HOST,
  DEFAULT_INSTALL_HOST,
  DEFAULT_ALIASES
} = require('../constants')

class Config {
  constructor () {
    this.conf = new Conf({ projectName: PROJECT_NAME })
  }

  getInstallHost () {
    return this.conf.get('installHost', DEFAULT_INSTALL_HOST)
  }

  getApiHost () {
    return this.conf.get('apiHost', DEFAULT_API_HOST)
  }

  setApiHost (host) {
    return this.conf.set('apiHost', host)
  }

  getPath () {
    return path.resolve(this.conf.path, '..')
  }

  setAlias (cmd, variant, alias) {
    const existingAliases = this.getAliases() || DEFAULT_ALIASES
    const nextVariant = Object.assign({}, existingAliases[variant], { [cmd]: alias })
    return this.conf.set('aliases', Object.assign({}, existingAliases, { [variant]: nextVariant }))
  }

  deleteAlias (cmd, variant) {
    const existingAliases = this.getAliases() || DEFAULT_ALIASES
    delete existingAliases[variant][cmd]
    return this.conf.set('aliases', existingAliases)
  }

  getAliases () {
    return this.conf.get('aliases') || DEFAULT_ALIASES
  }

  getApiKey () {
    return this.conf.get('apiKey')
  }

  setApiKey (apiKey) {
    return this.conf.set('apiKey', apiKey)
  }

  setLastRunlog (logpath) {
    return this.conf.set('lastRunlog', logpath)
  }

  getLastRunlog (logpath) {
    return this.conf.get('lastRunlog', logpath)
  }

  getInstallDir () {
    return this.conf.get('installDir')
  }

  setInstallDir (dir) {
    return this.conf.set('installDir', dir)
  }

  getUpdateAvailable () {
    return this.conf.get('updateAvailable')
  }

  setUpdateAvailable (val) {
    return this.conf.set('updateAvailable', val)
  }

  getLastUpdateCheck () {
    return this.conf.get('lastUpdateCheck', 0)
  }

  setLastUpdateCheck (lastUpdateCheck) {
    return this.conf.set('lastUpdateCheck', lastUpdateCheck)
  }
}

module.exports = Config
