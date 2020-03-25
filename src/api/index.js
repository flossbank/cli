const qs = require('querystring')
const fetch = require('./fetch')
const { ROUTES } = require('../constants')

function Api ({ config, runlog }) {
  this.url = config.getApiHost()
  this.config = config
  this.runlog = runlog

  this.unseen = []
  this.seen = []
  this.noAds = false
}

Api.prototype.getApiKey = function getApiKey () {
  return this.config.getApiKey()
}

Api.prototype.getSeenAds = function getSeenAds () {
  return this.seen.slice()
}

Api.prototype.fetchAd = async function fetchAd () {
  if (!this.unseen.length && !this.noAds) {
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
  let error = null
  try {
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`did not receive ok response from api: ${res.status}`)
    const json = await res.json()
    ads = json.ads
    if (!ads || !ads.length) {
      // signal to the class that we won't keep calling the API for more ads
      // as the API has given us no ads on this call
      this.runlog.debug('no ads returned from api, disabling ad fetching for rest of session')
      this.noAds = true
    }
    this.sessionId = json.sessionId
  } catch (e) {
    error = e
    this.runlog.error('could not fetch ads: %O', e)
  }
  this.unseen.push(...ads || [])
  return { newAds: this.unseen.length, error }
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
  // can't use createRequest for this call since we might not an api key yet (probably don't)
  try {
    const res = await fetch(`${this.url}/${ROUTES.CHECK_AUTH}`, {
      headers: {
        'x-requested-with': 'XmlHttpRequest',
        'content-type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ email, apiKey })
    })
    if (!res.ok) return false
    return true
  } catch (e) {
    this.runlog.error('could not check auth: %O', e)
    return false
  }
}

Api.prototype.completeSession = async function completeSession (sessionData = {}) {
  let packages, registry, language, pmVersion, flossbankVersion
  try {
    ([packages, registry, language, pmVersion, flossbankVersion] = await Promise.all(sessionData))
  } catch (e) {
    this.runlog.error('failed to resolve session data: %O', e)
  }
  const sessionCompleteData = {
    packages,
    registry,
    language,
    metadata: {
      packageManagerVersion: pmVersion,
      flossbankVersion
    }
  }
  this.runlog.record(this.runlog.keys.SESSION_COMPLETE_DATA, sessionCompleteData)

  const seenAdIds = this.seen.map(ad => ad.id)
  const [url, options] = this.createRequest(ROUTES.COMPLETE, 'POST', { seen: seenAdIds, ...sessionCompleteData })
  this.runlog.record(this.runlog.keys.SEEN_AD_IDS, seenAdIds)

  try {
    return fetch(url, options)
  } catch (e) {
    this.runlog.error('failed to complete session: %O', e)
  }
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
