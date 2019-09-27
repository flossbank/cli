const defaultAds = require('./data/defaultAds.json')

function getDefaultAdGetter () {
  const adCount = defaultAds.length
  let startIdx = Math.floor(Math.random() * adCount)
  return function getDefaultAd () {
    return defaultAds[startIdx++ % adCount]
  }
}

module.exports = function getAdGetter () {
  const getDefaultAd = getDefaultAdGetter()
  return function getAd () {
    try {
      // get ad from API
      throw new Error('not implemented')
    } catch (e) {
      return getDefaultAd()
    }
  }
}
