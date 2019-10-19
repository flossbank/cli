#!/usr/bin/env node
const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const { INTERVAL } = require('./constants')
const supported = new Set(['npm'])

async function done (err, api) {
  api.completeSession()
  process.exit(err ? 1 : 0)
}

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
  const api = new Api()
  const config = new Config()
  const ui = new Ui(api, INTERVAL)
  const startPm = () => pm((e) => done(e, api))

  try {
    await config.init()
  } catch (_) {
    // not able to initialize config; pass control to pm
    startPm()
    return
  }
  if (!config.getApiKey()) {
    const authToken = await ui.auth()
    if (!authToken) {
      // something went wrong with getting the token
      // pass control to pm and leave
      startPm()
      return
    }
    await config.setApiKey(authToken)
  }

  api.setApiKey(config.getApiKey())

  ui.startAds()
  startPm()
}

main()
