const Conf = require('conf')
const path = require('path')
const {
  PROJECT_NAME,
  CONFIG_API_KEY,
  CONFIG_ALIASES,
  CONFIG_LAST_RUNLOG
} = require('../constants')

function Config () {
  this.conf = new Conf({
    projectName: PROJECT_NAME
  })
}

Config.prototype.getPath = function getPath () {
  return path.resolve(this.conf.path, '..')
}

Config.prototype.addAlias = function addAlias (cmd, alias) {
  const existingAliases = this.getAliases() || {}
  return this.conf.set(CONFIG_ALIASES, Object.assign({}, existingAliases, { [cmd]: alias }))
}

Config.prototype.removeAlias = function removeAlias (cmd, unalias) {
  const existingAliases = this.getAliases() || {}
  return this.conf.set(CONFIG_ALIASES, Object.assign({}, existingAliases, { [cmd]: unalias }))
}

Config.prototype.getAliases = function getAliases () {
  return this.conf.get(CONFIG_ALIASES)
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
