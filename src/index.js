#!/usr/bin/env node
const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const { INTERVAL } = require('./constants')
const supported = new Set(['npm'])

async function main () {
  // TODO: show help / run auth flow if no params are passed in

  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pmArg = process.argv.splice(2, 1).pop()

  if (!supported.has(pmArg)) {
    console.error(`Unsupported package manager. Currently supported: ${[...supported]}`)
    process.exit(1)
  }
  const pm = require(`./pm/${pmArg}`)
  const pmArgs = new Set(process.argv)
  const pmCmd = [pmArg, ...process.argv.slice(2)].join(' ')
  const shouldShowAds = pmArgs.has('install') || pmArgs.has('i')
  const noAdsPm = () => pm({ silent: false }, (e) => {
    process.exit(e ? 1 : 0)
  })

  if (!shouldShowAds) {
    return noAdsPm()
  }

  const api = new Api()
  const config = new Config()
  const ui = new Ui(api, INTERVAL, pmCmd, async () => {
    try {
      await api.completeSession()
    } catch (_) {}
  })

  const adsPm = () => {
    pm({ silent: true }, (e, stdout, stderr) => {
      ui.setPmOutput(e, stdout, stderr)
    })
  }

  try {
    await config.init()
  } catch (_) {
    // not able to initialize config; pass control to pm
    return noAdsPm()
  }
  if (!config.getApiKey()) {
    const authToken = await ui.auth()
    if (!authToken) {
      // something went wrong with getting the token
      // pass control to pm and leave
      return noAdsPm()
    }
    await config.setApiKey(authToken)
  }

  api.setApiKey(config.getApiKey())

  ui.startAds()
  adsPm()
}

main()
