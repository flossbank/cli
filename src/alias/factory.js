const os = require('os')
const WindowsAliasController = require('./windows')
const NixAliasController = require('./nix')

class AliasFactory {
  static createAliasController (dependencies) {
    if (os.platform() === 'win32') return new WindowsAliasController(dependencies)
    return new NixAliasController(dependencies)
  }
}

module.exports = AliasFactory
