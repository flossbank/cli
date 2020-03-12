const {
  SHEBANG,
  PROJECT_NAME
} = require('../constants')
const Alias = require('.')

class NixAliasController extends Alias {
  _convertConfigToAliases (aliasList) {
    const lines = Object.keys(aliasList).reduce((file, alias) => file + aliasList[alias] + '\n', '')
    return SHEBANG + '\n\n' + lines
  }

  _getAliasFileName () {
    return 'flossbank_aliases.sh'
  }

  _getSourceCommand () {
    return ['.', this.getSourceFilePath()].join(' ')
  }

  _createAlias (cmd) {
    return `unalias ${cmd} 2>/dev/null; ${cmd} () { command -v ${PROJECT_NAME} >/dev/null 2>&1 && ${PROJECT_NAME} ${cmd} $@ || command ${cmd} $@; };`
  }

  _createRemoveAlias () {
    return ''
  }
}

module.exports = NixAliasController
