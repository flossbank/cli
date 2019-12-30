const qs = require('querystring')
const fetch = require('node-fetch')
const { API_HOST, ROUTES } = require('../constants')

function Api ({ config }) {
  this.url = API_HOST
  this.config = config
  this.packages = null
  this.unseen = []
  this.seen = []
}

Api.prototype.getApiKey = function getApiKey () {
  return this.config.getApiKey()
}

Api.prototype.setTopLevelPackages = function setTopLevelPackages (pkgs) {
  this.packages = pkgs
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
  const [url, options] = this.createRequest(ROUTES.GET_AD, 'POST', {
    registry: 'npm',
    packages: this.packages
  })
  let ads = []
  try {
    const res = await fetch(url, options)
    const json = await res.json()
    ads = json.ads
    this.sessionId = json.sessionId
  } catch (_) { }
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
  const [url, options] = this.createRequest(ROUTES.COMPLETE, 'POST', { seen: this.seen })
  return fetch(url, options)
}

Api.prototype.createRequest = function createRequest (endpoint, method, payload) {
  if (!this.getApiKey()) throw new Error('no api key; unable to reach api')
  let url = `${this.url}/${endpoint}`
  const body = Object.assign({}, { sessionId: this.sessionId }, payload)
  const options = {
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${this.getApiKey()}`
    },
    method,
    ...method === 'POST' && { body: JSON.stringify(body) }
  }
  if (method === 'GET') {
    url += `?${qs.stringify(body)}`
  }
  return [url, options]
}

module.exports = Api
