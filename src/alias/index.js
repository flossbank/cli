const { EOL } = require('os')
const { join } = require('path')
const { SUPPORTED_PMS } = require('../constants')
const { writeFileAsync } = require('../util/asyncFs')

// abstract class; override stub methods
class Alias {
  constructor ({ config, profile }) {
    this.config = config
    this.profile = profile

    this._writeFileAsync = writeFileAsync
  }

  async aliasAllSupportedPackageManagers () {
    SUPPORTED_PMS.forEach((pm) => this._addAlias(pm))
    await this._writeSourceFile()
    return this.profile.addToProfiles(this._getSourceCommand())
  }

  async unaliasAllSupportedPackageManagers () {
    SUPPORTED_PMS.forEach((pm) => this._removeAlias(pm))
    await this._writeSourceFile()
    return this.profile.removeFromProfiles(this._getSourceCommand())
  }

  list () {
    return this.config.getAliases()
  }

  getSourceFilePath () {
    return join(this.config.getPath(), this._getAliasFileName())
  }

  _addAlias (cmd) {
    return this.config.addAlias(cmd, this._createAlias(cmd))
  }

  _removeAlias (cmd) {
    return this.config.removeAlias(cmd, this._createRemoveAlias(cmd))
  }

  async _writeSourceFile () {
    return this._writeFileAsync(this.getSourceFilePath(), this._convertConfigToAliases(this.list()))
  }

  _convertConfigToAliases (aliasList) {
    return Object.keys(aliasList).reduce((file, alias) => file + aliasList[alias] + EOL, '')
  }

  _getAliasFileName () {
    throw new Error('override this stub with os-specific logic')
  }

  _getSourceCommand () {
    throw new Error('override this stub with os-specific logic')
  }

  _createAlias (cmd) {
    throw new Error('override this stub with os-specific logic')
  }

  _createRemoveAlias () {
    throw new Error('override this stub with os-specific logic')
  }
}

module.exports = Alias
