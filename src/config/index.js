const Conf = require('conf')
const path = require('path')
const {
  PROJECT_NAME,
  DEFAULT_API_HOST,
  CONFIG_API_KEY,
  CONFIG_API_HOST,
  CONFIG_ALIASES,
  CONFIG_LAST_RUNLOG,
  CONFIG_AUTH_OVERRIDES,
  DEFAULT_ALIASES
} = require('../constants')

class Config {
  constructor () {
    this.conf = new Conf({ projectName: PROJECT_NAME })
  }

  getApiHost () {
    return this.conf.get(CONFIG_API_HOST, DEFAULT_API_HOST)
  }

  setApiHost (host) {
    return this.conf.set(CONFIG_API_HOST, host)
  }

  getPath () {
    return path.resolve(this.conf.path, '..')
  }

  setAlias (cmd, variant, alias) {
    const existingAliases = this.getAliases() || DEFAULT_ALIASES
    const nextVariant = Object.assign({}, existingAliases[variant], { [cmd]: alias })
    return this.conf.set(CONFIG_ALIASES, Object.assign({}, existingAliases, { [variant]: nextVariant }))
  }

  deleteAlias (cmd, variant) {
    const existingAliases = this.getAliases() || DEFAULT_ALIASES
    delete existingAliases[variant][cmd]
    return this.conf.set(CONFIG_ALIASES, existingAliases)
  }

  getAliases () {
    return this.conf.get(CONFIG_ALIASES) || DEFAULT_ALIASES
  }

  getApiKey () {
    return this.conf.get(CONFIG_API_KEY)
  }

  async setApiKey (apiKey) {
    return this.conf.set(CONFIG_API_KEY, apiKey)
  }

  setLastRunlog (logpath) {
    return this.conf.set(CONFIG_LAST_RUNLOG, logpath)
  }

  getLastRunlog (logpath) {
    return this.conf.get(CONFIG_LAST_RUNLOG, logpath)
  }

  getAuthOverrides () {
    const overrides = this.conf.get(CONFIG_AUTH_OVERRIDES) || {}
    this.conf.delete(CONFIG_AUTH_OVERRIDES) // only allow overrides to be used once after setting
    return overrides
  }

  setAuthOverrides (overrides) {
    return this.conf.set(CONFIG_AUTH_OVERRIDES, overrides)
  }
}

module.exports = Config
