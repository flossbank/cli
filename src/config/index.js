const path = require('path')
const { homedir } = require('os')
const { readFile, writeFile } = require('fs')
const { promisify } = require('util')
const makeDir = require('make-dir')
const {
  DEFAULT_CONFIG,
  CONFIG_DIR,
  CONFIG_FILENAME
} = require('../constants')

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

function Config () {
  this.configPath = path.join(homedir(), CONFIG_DIR)
  this.configFile = path.join(this.configPath, CONFIG_FILENAME)
  this.config = null
}

Config.prototype.init = async function init () {
  this.config = await readConfigFile(this.configFile)
}

Config.prototype.getApiKey = function getApiKey () {
  return this.config.apiKey
}

Config.prototype.setApiKey = async function setApiKey (apiKey) {
  this.config.apiKey = apiKey
  await writeConfigFile(this.configPath, this.configFile, this.config)
}

async function readConfigFile (configFile) {
  let config
  try {
    const file = await readFileAsync(configFile, 'utf8')
    config = JSON.parse(file)
  } catch (_) {
    return DEFAULT_CONFIG
  }
  return config || DEFAULT_CONFIG
}

async function writeConfigFile (configPath, configFile, config) {
  await makeDir(configPath)
  await writeFileAsync(configFile, JSON.stringify(config))
}

module.exports = Config
