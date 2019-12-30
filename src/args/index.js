function buildArgs (help) {
  const [h] = help.split('')
  return [`--${help}`, `-${h}`, `${help}`]
}

function Args () {

}

Args.prototype.init = function init () {
  const firstArg = process.argv[2]
  if (buildArgs('help').includes(firstArg) || !firstArg) {
    return { hasArgs: true, help: true }
  }
  if (buildArgs('auth').includes(firstArg)) {
    return { hasArgs: true, auth: true }
  }
  return {}
}

module.exports = Args
