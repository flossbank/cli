#!/usr/bin/env node
const Api = require('./api')
const showAd = require('./ui/showAd')
const { INTERVAL } = require('./constants')
const supported = new Set(['yarn', 'npm'])

function main () {
  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pmArg = process.argv.splice(2, 1).pop()

  if (!supported.has(pmArg)) {
    console.error('Unsupported Package Manager. NPM and Yarn are currently supported.')
    process.exit(1)
  }

  const api = new Api()
  const pm = require(`./pm/${pmArg}`)

  async function done (err) {
    api.completeSession()
    process.exit(err ? 1 : 0)
  }

  (async function showAds () {
    await showAd(() => api.fetchAd())
    setTimeout(showAds, INTERVAL)
  })()

  pm(done)
}

main()
