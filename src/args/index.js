const { SUPPORTED_ARGS } = require('../constants')

const HANDLERS = SUPPORTED_ARGS.reduce((handlers, arg) => {
  handlers[arg] = require(`./${arg}`)
  return handlers
}, {})

function buildArgs (help) {
  const [h] = help.split('')
  return [`--${help}`, `-${h}`, `${help}`]
}

function Args ({ config, api, ui, alias, runlog }) {
  this.deps = { config, api, ui, alias, runlog }
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
  for (const arg of SUPPORTED_ARGS) {
    if (this.cmd[arg] && typeof HANDLERS[arg] === 'function') {
      await HANDLERS[arg](this.deps)
      break
    }
  }
}

module.exports = Args
