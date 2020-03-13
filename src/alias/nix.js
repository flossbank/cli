const Alias = require('.')
const { PROJECT_NAME } = require('../constants')

class NixAliasController extends Alias {
  _getAliasFileName () {
    return 'flossbank_aliases.sh'
  }

  _getSourceCommand () {
    return `. "${this.getSourceFilePath()}"`
  }

  _createAlias (cmd) {
    return `unalias ${cmd} 2>/dev/null; ${cmd} () { command -v ${PROJECT_NAME} >/dev/null 2>&1 && ${PROJECT_NAME} ${cmd} $@ || command ${cmd} $@; };`
  }

  _createRemoveAlias () {
    return ''
  }
}

module.exports = NixAliasController
