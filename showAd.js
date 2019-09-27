const control = require('console-control-strings')
const { isSilentMode, isCI } = require('./lib/detect')
const format = require('./lib/format')
const getAd = require('./getAd')()

module.exports = async function showAd (interval = 5000) {
  if (isSilentMode() || isCI()) return

  const ad = await getAd()
  const formattedAd = format(ad)
  process.stderr.write(control.gotoSOL() + control.eraseLine())
  console.log('\n\n' + formattedAd)

  setTimeout(showAd, interval)
}
