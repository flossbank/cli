const { SUPPORTED_ARGS } = require('../constants')

function buildArgs (help) {
  const [h] = help.split('')
  return [`--${help}`, `-${h}`, `${help}`]
}

function Args ({ config, api, ui, alias }) {
  this.config = config
  this.api = api
  this.ui = ui
  this.alias = alias

  this.cmd = {}
}

Args.prototype.init = function init () {
  const firstArg = process.argv[2]

  // handle no arg; display help msg
  if (!firstArg) {
    this.cmd = { hasArgs: true, help: true }
    return this.cmd
  }

  for (const arg of SUPPORTED_ARGS) {
    if (buildArgs(arg).includes(firstArg)) {
      this.cmd = { hasArgs: true, [arg]: true }
      return this.cmd
    }
  }

  return this.cmd
}

Args.prototype.act = async function act () {
  const { help, auth, install, uninstall, source } = this.cmd

  if (help) {
    this.ui.showHelp()
  } else if (auth) {
    const apiKey = await this.ui.authenticate({
      haveApiKey: !!this.config.getApiKey(),
      sendAuthEmail: this.api.sendAuthEmail.bind(this.api)
    })
    if (!apiKey) return
    this.config.setApiKey(apiKey)
  } else if (install) {
    try {
      await this.alias.aliasAll()
    } catch (e) {
      this.ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
      return
    }
    this.ui.info('Flossbank successfully installed for supported package managers.')
  } else if (uninstall) {
    try {
      await this.alias.unaliasAll()
    } catch (e) {
      this.ui.error('Flossbank failed to uninstall. Please contact support@flossbank.com for help.')
      return
    }
    this.ui.info('Flossbank successfully uninstalled from supported package managers.')
  } else if (source) {
    console.log(this.alias.getSourceFilePath())
  }
}

module.exports = Args
