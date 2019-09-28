const control = require('console-control-strings')
const { isSilentMode, isCI } = require('../util/detect')
const format = require('./format')

module.exports = async function showAd (fetchAd) {
  if (isSilentMode() || isCI()) return

  let ad
  try {
    ad = await fetchAd()
  } catch (e) {
    return
  }
  if (!ad) return
  const formattedAd = format(ad)

  process.stderr.write(control.gotoSOL() + control.eraseLine())
  console.log('\n\n' + formattedAd)
}
