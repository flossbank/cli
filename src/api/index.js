const fetch = require('node-fetch')
const {
  API_HOST,
  API_HOST_TEST,
  ROUTES
} = require('../constants')

function Api () {
  this.url = process.env.NODE_ENV === 'production'
    ? API_HOST
    : API_HOST_TEST
  this.key = null
  this.unseen = []
  this.seen = []
}

Api.prototype.setApiKey = function setApiKey (key) {
  this.key = key
}

Api.prototype.fetchAd = async function fetchAd () {
  if (!this.unseen.length) {
    await this.fetchAdBatch()
  }
  const ad = this.unseen.pop()
  if (!ad) {
    throw new Error('no ad available')
  }
  this.seen.push(ad.id)
  return ad
}

Api.prototype.fetchAdBatch = async function fetchAdBatch () {
  const [url, options] = this.createRequest(ROUTES.GET_AD, 'GET')
  let ads = []
  try {
    const res = await fetch(url, options)
    ads = await res.json()
  } catch (_) {}
  this.unseen.push(...ads)
}

Api.prototype.sendAuthEmail = async function sendAuthEmail (email) {
  // can't use createRequest for this call since we necessarily have no api key yet
  return fetch(`${this.url}/${ROUTES.SEND_AUTH}`, {
    headers: { 'content-type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

Api.prototype.completeSession = async function completeSession () {
  const [url, options] = this.createRequest(ROUTES.COMPLETE, 'POST', this.seen)
  return fetch(url, options)
}

Api.prototype.createRequest = function createRequest (endpoint, method, body) {
  if (!this.key) throw new Error('no api key; unable to reach api')
  const url = `${this.url}/${endpoint}`
  const options = {
    headers: {
      'content-type': 'application/json',
      authentication: `Bearer ${this.key}`
    },
    method,
    body: JSON.stringify(body)
  }
  return [url, options]
}

module.exports = Api
