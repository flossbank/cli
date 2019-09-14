const control = require('console-control-strings')
const { isSilentMode } = require('./lib/detect')
const defaultAds = require('./data/defaultAds.json')
const format = require('./lib/format')

const adCount = defaultAds.length
let startIdx = Math.floor(Math.random() * adCount)

module.exports = function showAd (interval = 3000) {
  if (isSilentMode()) return

  const ad = defaultAds[startIdx++ % adCount]
  const formattedAd = format(ad)
  process.stderr.write(control.gotoSOL() + control.eraseLine())
  console.log('\n\n' + formattedAd)

  setTimeout(showAd, interval)
}
