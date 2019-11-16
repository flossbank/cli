#!/usr/bin/env node
const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const { INTERVAL, SUPPORTED_PMS } = require('./constants')

async function main () {
  // TODO: show help / run auth flow if no params are passed in

  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pmArg = process.argv.splice(2, 1).pop()

  if (!SUPPORTED_PMS.includes(pmArg)) {
    console.error(`Unsupported package manager. Currently supported: ${SUPPORTED_PMS}`)
    process.exit(1)
  }
  const pm = require(`./pm/${pmArg}`)
  const pmCmd = [pmArg, ...process.argv.slice(2)].join(' ')
  const shouldShowAds = pm.isSupportedVerb(pmCmd)
  const noAdsPm = () => pm.start({ silent: false }, (e) => {
    process.exit(e ? 1 : 0)
  })

  if (!shouldShowAds) {
    return noAdsPm()
  }
  const topLevelPackages = await pm.getTopLevelPackages()
  const api = new Api(pmArg, topLevelPackages)
  const config = new Config()
  const ui = new Ui(api, INTERVAL, pmCmd, async () => {
    try {
      await api.completeSession()
    } catch (_) {}
  })

  const adsPm = () => {
    pm.start({ silent: true }, (e, stdout, stderr) => {
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
