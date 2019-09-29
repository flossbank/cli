#!/usr/bin/env node
const Api = require('./api')
const Config = require('./config')
const showAd = require('./ui/showAd')
const { INTERVAL } = require('./constants')
const supported = new Set(['yarn', 'npm'])

async function done (err, api) {
  api.completeSession()
  process.exit(err ? 1 : 0)
}

async function showAds (api) {
  await showAd(() => api.fetchAd())
  setTimeout(showAds, INTERVAL)
}

async function main () {
  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pmArg = process.argv.splice(2, 1).pop()

  if (!supported.has(pmArg)) {
    console.error('Unsupported Package Manager. NPM and Yarn are currently supported.')
    process.exit(1)
  }

  const pm = require(`./pm/${pmArg}`)
  const api = new Api()
  const config = new Config()
  const start = () => pm((e) => done(e, api))

  try {
    await config.init()
  } catch (_) {
    // not able to initialize config; pass control to pm
    start()
    return
  }
  if (!config.getApiKey()) {
    // TODO launch one-time auth flow
  } else {
    api.setApiKey(config.getApiKey())
  }

  showAds(api)
  start()
}

main()
