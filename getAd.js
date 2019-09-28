const qs = require('querystring')
const fetch = require('node-fetch')
const { machineId } = require('node-machine-id')
const {
  DEFAULT_ADS,
  AD_URI,
  GET_AD,
  COMPLETE
} = require('./constants')

// TODO delete this b.s. completely
// there is no good reason to show ads to someone if we can't track it
// default ads == nobody gets paid, devs get sad
// it can be deleted when the ad getter lambda is up
function getDefaultAdGetter () {
  const adCount = DEFAULT_ADS.length
  let startIdx = Math.floor(Math.random() * adCount)
  return function getDefaultAd () {
    return DEFAULT_ADS[startIdx++ % adCount]
  }
}

function createUrl (id, endpoint) {
  return `${AD_URI}/${endpoint}?${qs.stringify({ id })}`
}

async function fetchAdBatch (id) {
  const res = await fetch(createUrl(id, GET_AD))
  return res.json()
}

async function fetchComplete (seen, id) {
  return fetch(createUrl(id, COMPLETE), {
    method: 'POST',
    body: JSON.stringify(seen)
  })
}

async function getAdFetcher () {
  const id = await machineId()
  const unseen = []
  const seen = []

  return async function fetchAd (complete) {
    if (complete) {
      return fetchComplete(seen, id)
    }
    if (!unseen.length) {
      unseen.push(...await fetchAdBatch(id))
    }
    const ad = unseen.pop()
    if (!ad) {
      throw new Error('no ad available')
    }
    seen.push(ad.id)
    return ad
  }
}

module.exports = async function getAdGetter () {
  const getDefaultAd = getDefaultAdGetter()
  const fetchAd = await getAdFetcher()
  return async function getAd (complete) {
    if (complete) {
      try {
        return fetchAd(complete)
      } catch (e) {}
    }
    try {
      return fetchAd()
    } catch (e) {
      return getDefaultAd()
    }
  }
}
