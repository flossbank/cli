const { promises: { writeFile } } = require('fs')
const path = require('path')
const makeDir = require('make-dir')
const del = require('del')
const os = require('os')

/**
 * Env is responsible for writing the $FLOSSBANK_DIR/env and env.ps1 files
 * These files add `flossbank` to PATH and source the alias file
 */
class Env {
  constructor ({ config, alias }) {
    this.config = config
    this.alias = alias

    this._writeFileAsync = writeFile
  }

  async writeEnvFiles () {
    await makeDir(this.config.getInstallDir())
    await this.writeShellEnv()
    await this.writePowerEnv()
  }

  async deleteEnvFiles () {
    await del(this._getShellEnvPath(), { force: true })
    await del(this._getPowerEnvPath(), { force: true })
  }

  async writeShellEnv () {
    const envFile = `${this._getShellPathModifier()}\n${this.alias.getShellSourceCommand()}`
    const envPath = this._getShellEnvPath()
    return this._writeFileAsync(envPath, envFile)
  }

  async writePowerEnv () {
    const envFile = `${this._getPowerPathModifier()}\n${this.alias.getPowerSourceCommand()}`
    const envPath = this._getPowerEnvPath()
    return this._writeFileAsync(envPath, envFile)
  }

  getShellSourceCommand () {
    return `. ${this._getShellEnvPath()}`
  }

  getPowerSourceCommand () {
    return `. ${this._getPowerEnvPath()}`
  }

  _getShellEnvPath () {
    return path.join(this.config.getInstallDir(), 'env')
  }

  _getPowerEnvPath () {
    return path.join(this.config.getInstallDir(), 'env.ps1')
  }

  _getShellPathModifier () {
    const installDir = this.config.getInstallDir()
    const binDir = path.join(installDir, 'bin')
    return `export PATH="${binDir}:$PATH"`
  }

  _getPowerPathModifier () {
    const installDir = this.config.getInstallDir()
    const binDir = path.join(installDir, 'bin')
    const separator = os.platform() === 'win32' ? ';' : ':'
    return `$ENV:PATH="$ENV:PATH${separator}${binDir}"`
  }
}

module.exports = Env
