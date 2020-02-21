const qs = require('querystring')
const debug = require('debug')('flossbank')
const fetch = require('./fetch')
const { API_HOST, ROUTES } = require('../constants')

function Api ({ config }) {
  this.url = API_HOST
  this.config = config

  this.unseen = []
  this.seen = []
}

Api.prototype.getApiKey = function getApiKey () {
  return this.config.getApiKey()
}

Api.prototype.getSeenAds = function getSeenAds () {
  return this.seen.slice()
}

Api.prototype.fetchAd = async function fetchAd () {
  if (!this.unseen.length) {
    debug('unseen ads list is empty, requesting more')
    await this.fetchAdBatch()
  }
  const ad = this.unseen.pop()
  if (!ad) {
    throw new Error('no ad available')
  }
  this.seen.push(ad)
  return ad
}

Api.prototype.fetchAdBatch = async function fetchAdBatch () {
  const [url, options] = this.createRequest(ROUTES.START, 'POST', {})
  let ads = []
  try {
    const res = await fetch(url, options)
    const json = await res.json()
    ads = json.ads
    this.sessionId = json.sessionId
  } catch (e) {
    debug('could not fetch ads: %O', e)
  }
  this.unseen.push(...ads || [])
  return this.unseen.length
}

Api.prototype.sendAuthEmail = async function sendAuthEmail (email) {
  // can't use createRequest for this call since we necessarily have no api key yet
  return fetch(`${this.url}/${ROUTES.SEND_AUTH}`, {
    headers: {
      'x-requested-with': 'XmlHttpRequest',
      'content-type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

Api.prototype.completeSession = async function completeSession (sessionData = {}) {
  debug('completeing session with session data: %O', sessionData)
  const seenAdIds = this.seen.map(ad => ad.id)
  const [url, options] = this.createRequest(ROUTES.COMPLETE, 'POST', { seen: seenAdIds, ...sessionData })
  debug('completing session with these ad ids: %O', seenAdIds)
  return fetch(url, options)
}

Api.prototype.createRequest = function createRequest (endpoint, method, payload) {
  if (!this.getApiKey()) throw new Error('no api key; unable to reach api')
  let url = `${this.url}/${endpoint}`
  const body = Object.assign({}, { sessionId: this.sessionId }, payload)
  const options = {
    headers: {
      'x-requested-with': 'XmlHttpRequest',
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
