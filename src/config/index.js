const Conf = require('conf')
const path = require('path')
const {
  PROJECT_NAME,
  DEFAULT_API_HOST,
  CONFIG_API_KEY,
  CONFIG_API_HOST,
  CONFIG_ALIASES,
  CONFIG_LAST_RUNLOG,
  DEFAULT_ALIASES
} = require('../constants')

function Config () {
  this.conf = new Conf({
    projectName: PROJECT_NAME
  })
}

Config.prototype.getApiHost = function getApiHost () {
  return this.conf.get(CONFIG_API_HOST, DEFAULT_API_HOST)
}

Config.prototype.setApiHost = function setApiHost (host) {
  return this.conf.set(CONFIG_API_HOST, host)
}

Config.prototype.getPath = function getPath () {
  return path.resolve(this.conf.path, '..')
}

Config.prototype.setAlias = function addAlias (cmd, variant, alias) {
  const existingAliases = this.getAliases() || DEFAULT_ALIASES
  const nextVariant = Object.assign({}, existingAliases[variant], { [cmd]: alias })
  return this.conf.set(CONFIG_ALIASES, Object.assign({}, existingAliases, { [variant]: nextVariant }))
}

Config.prototype.deleteAlias = function deleteAlias (cmd, variant) {
  const existingAliases = this.getAliases() || DEFAULT_ALIASES
  delete existingAliases[variant][cmd]
  return this.conf.set(CONFIG_ALIASES, existingAliases)
}

Config.prototype.getAliases = function getAliases () {
  return this.conf.get(CONFIG_ALIASES) || DEFAULT_ALIASES
}

Config.prototype.getApiKey = function getApiKey () {
  return this.conf.get(CONFIG_API_KEY)
}

Config.prototype.setApiKey = async function setApiKey (apiKey) {
  return this.conf.set(CONFIG_API_KEY, apiKey)
}

Config.prototype.setLastRunlog = function setLastRunlog (logpath) {
  return this.conf.set(CONFIG_LAST_RUNLOG, logpath)
}

Config.prototype.getLastRunlog = function getLastRunlog (logpath) {
  return this.conf.get(CONFIG_LAST_RUNLOG, logpath)
}

module.exports = Config
