const Alias = require('.')

class WindowsAliasController extends Alias {
  _convertConfigToAliases (aliasList) {
    throw new Error('override this stub with os-specific logic')
  }

  _getAliasFileName () {
    throw new Error('override this stub with os-specific logic')
  }

  _getSourceCommand () {
    throw new Error('override this stub with os-specific logic')
    // return ['.', this.getSourceFilePath()].join(' ')
  }

  _createAlias (cmd) {
    throw new Error('override this stub with os-specific logic')
    // return `unalias ${cmd} 2>/dev/null; ${cmd} () { command -v ${PROJECT_NAME} >/dev/null 2>&1 && ${PROJECT_NAME} ${cmd} $@ || command ${cmd} $@; };`
  }

  _createRemoveAlias () {
    throw new Error('override this stub with os-specific logic')
    // return ''
  }
}

module.exports = WindowsAliasController
