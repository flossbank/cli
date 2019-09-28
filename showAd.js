const control = require('console-control-strings')
const { isSilentMode, isCI } = require('./lib/detect')
const format = require('./lib/format')
const { INTERVAL } = require('./constants')
const getAdGetter = require('./getAd')

let getAd

async function showAds (interval = INTERVAL) {
  if (isSilentMode() || isCI()) return
  if (!getAd) {
    getAd = await getAdGetter()
  }

  let ad
  try {
    ad = await getAd()
  } catch (_) {
    return
  }
  if (!ad) return
  const formattedAd = format(ad)

  process.stderr.write(control.gotoSOL() + control.eraseLine())
  console.log('\n\n' + formattedAd)

  setTimeout(showAds, interval)
}

module.exports = {
  showAds,
  async done (err) {
    await getAd(true)
    process.exit(err ? 1 : 0)
  }
}
