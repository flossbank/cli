const qs = require('querystring')
const fetch = require('./fetch')
const { API_HOST, ROUTES } = require('../constants')

function Api ({ config, runlog }) {
  this.url = API_HOST
  this.config = config
  this.runlog = runlog

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
    this.runlog.debug('unseen ads list is empty, requesting more')
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
    if (!res.ok) throw new Error(`did not receive ok response from api: ${res.status}`)
    const json = await res.json()
    ads = json.ads
    this.sessionId = json.sessionId
  } catch (e) {
    this.runlog.error('could not fetch ads: %O', e)
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

Api.prototype.checkAuth = async function checkAuth (email, apiKey) {
  const [url, options] = this.createRequest(ROUTES.CHECK_AUTH, 'POST', { email, apiKey })

  try {
    const res = await fetch(url, options)
    if (!res.ok) return false
    return true
  } catch (e) {
    this.runlog.error('could not check auth: %O', e)
    return false
  }
}

Api.prototype.completeSession = async function completeSession (sessionData = {}) {
  const seenAdIds = this.seen.map(ad => ad.id)
  const [url, options] = this.createRequest(ROUTES.COMPLETE, 'POST', { seen: seenAdIds, ...sessionData })
  this.runlog.record(this.runlog.keys.SEEN_AD_IDS, seenAdIds)
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
