const qs = require('querystring')
const fetch = require('node-fetch')
const {
  DEFAULT_ADS,
  AD_URI,
  AUTH,
  GET_AD,
  COMPLETE
} = require('../constants')

function Api () {
  this.id = null
  this.unseen = []
  this.seen = []
}

Api.prototype.setApiKey = function setApiKey (id) {
  this.id = id
}

Api.prototype.fetchAd = async function fetchAd () {
  if (!this.unseen.length) {
    if (process.env.NPMC_DEV) {
      this.unseen.push(...DEFAULT_ADS)
    } else {
      await this.fetchAdBatch()
    }
  }
  const ad = this.unseen.pop()
  if (!ad) {
    throw new Error('no ad available')
  }
  this.seen.push(ad.id)
  return ad
}

Api.prototype.fetchAdBatch = async function fetchAdBatch () {
  const url = createUrl(this.id, GET_AD)
  let ads = []
  try {
    const res = await fetch(url)
    ads = await res.json()
  } catch (_) {}
  this.unseen.push(...ads)
}

Api.prototype.sendAuthEmail = async function sendAuthEmail (email) {
  const url = createUrl('authentication', AUTH)
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

Api.prototype.completeSession = async function completeSession () {
  const url = createUrl(this.id, COMPLETE)
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(this.seen)
  })
}

function createUrl (id, endpoint) {
  if (!id) throw new Error('no id; unable to reach api')
  return `${AD_URI}/${endpoint}?${qs.stringify({ id })}`
}

module.exports = Api
