const { EOL } = require('os')
const { join } = require('path')
const {
  SUPPORTED_PMS,
  PROJECT_NAME,
  SOURCE_VARIANT_POWER,
  SOURCE_VARIANT_SHELL
} = require('../constants')
const { writeFileAsync } = require('../util/asyncFs')

/**
 * Alias wraps Config to persist alias commands for supported PMs in our config JSON file and handles writing
 *   the raw source file variants to disk.
 * Terms/ideas used throughout:
 *  - Alias: (usually) a function that wraps an existing package manager with Flossbank (e.g. npm) and falls back to the PM
 *  - Source file: a file written in our configuration directory that can be "sourced" by a shell
 *  - Source file variants: `shell` and `power` currently; `shell` files can be sourced by bash, zsh, etc. `power` files
 *      can be sourced by PowerShell. Variants are not OS-specific, but shell specific. (So far 2 variants covers all supported cases).
 *  - Source command: the command that, when run in the appropriate shell, sources the appropriate source file variant.
 * A map of aliases is persisted as JSON in our project's configuration directory. The map is converted to variant source files
 *   when `_writeSourceFiles` is called.
 */
class Alias {
  constructor ({ config }) {
    this.config = config

    this._writeFileAsync = writeFileAsync
  }

  async aliasAllSupportedPackageManagers () {
    SUPPORTED_PMS.forEach((pm) => this._addAliases(pm))
    return this._writeSourceFiles()
  }

  async unaliasAllSupportedPackageManagers () {
    SUPPORTED_PMS.forEach((pm) => this._removeAliases(pm))
    return this._writeSourceFiles()
  }

  getShellSourceCommand () {
    return `. "${this.getShellSourceFilePath()}" > /dev/null 2>&1`
  }

  getPowerSourceCommand () {
    return `. "${this.getPowerSourceFilePath()}" > $null 2>&1`
  }

  getShellSourceFilePath () {
    return join(this.config.getPath(), 'flossbank_aliases.sh')
  }

  getPowerSourceFilePath () {
    return join(this.config.getPath(), 'flossbank_aliases.ps1')
  }

  _addAliases (cmd) {
    this.config.setAlias(cmd, SOURCE_VARIANT_SHELL, this._createShellAlias(cmd))
    this.config.setAlias(cmd, SOURCE_VARIANT_POWER, this._createPowerAlias(cmd))
  }

  _removeAliases (cmd) {
    this.config.deleteAlias(cmd, SOURCE_VARIANT_SHELL)
    this.config.deleteAlias(cmd, SOURCE_VARIANT_POWER)
  }

  async _writeSourceFiles () {
    await this._writeShellSourceFile()
    await this._writePowerSourceFile()
  }

  async _writeShellSourceFile () {
    return this._writeFileAsync(
      this.getShellSourceFilePath(),
      this._convertConfigToAliases(
        this.config.getAliases()[SOURCE_VARIANT_SHELL]
      )
    )
  }

  async _writePowerSourceFile () {
    return this._writeFileAsync(
      this.getPowerSourceFilePath(),
      this._convertConfigToAliases(
        this.config.getAliases()[SOURCE_VARIANT_POWER]
      )
    )
  }

  _convertConfigToAliases (aliasList) {
    return Object.keys(aliasList).reduce((file, alias) => file + aliasList[alias] + EOL, '')
  }

  _createShellAlias (cmd) {
    return `unalias ${cmd} 2>/dev/null; ${cmd} () { command -v ${PROJECT_NAME} >/dev/null 2>&1 && ${PROJECT_NAME} ${cmd} $@ || command ${cmd} $@; };`
  }

  _createPowerAlias (cmd) {
    return `function ${cmd} { if (Get-Command ${PROJECT_NAME} -ea Ignore) { ${PROJECT_NAME} ${cmd} @args } else {  &(Get-Command -Name ${cmd} -Type Application)[0] @args } }`
  }
}

module.exports = Alias
