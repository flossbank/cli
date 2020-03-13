const Alias = require('.')
const { PROJECT_NAME } = require('../constants')

class WindowsAliasController extends Alias {
  _getAliasFileName () {
    return 'flossbank_aliases.ps1'
  }

  _getSourceCommand () {
    return `. "${this.getSourceFilePath()}" > $null 2>&1`
  }

  _createAlias (cmd) {
    return `function ${cmd} { if (Get-Command ${PROJECT_NAME} -ea Ignore) { ${PROJECT_NAME} ${cmd} @args } else {  &(Get-Command -Name ${cmd} -Type Application)[0] @args } }`
  }

  _createRemoveAlias () {
    return ''
  }
}

module.exports = WindowsAliasController
