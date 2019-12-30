const Conf = require('conf')
const {
  PROJECT_NAME,
  CONFIG_API_KEY
} = require('../constants')

function Config () {
  this.conf = new Conf({
    projectName: PROJECT_NAME
  })
}

Config.prototype.getApiKey = function getApiKey () {
  return this.conf.get(CONFIG_API_KEY)
}

Config.prototype.setApiKey = async function setApiKey (apiKey) {
  return this.conf.set(CONFIG_API_KEY, apiKey)
}

module.exports = Config
