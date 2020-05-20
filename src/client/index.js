const HttpAgent = require('agentkeepalive')
const got = require('got')
const { HttpsAgent } = HttpAgent

class ApiClient {
  constructor ({ config, runlog }) {
    this.url = config.getApiHost()
    this.apiKey = config.getApiKey()
    this.got = got.extend({
      prefixUrl: this.url,
      headers: {
        'x-requested-with': 'XmlHttpRequest',
        'content-type': 'application/json',
        authorization: `Bearer ${this.apiKey}`
      },
      responseType: 'json',
      resolveBodyOnly: true,
      agent: {
        http: new HttpAgent(),
        https: new HttpsAgent()
      }
    })

    this.routes = {
      SESSION_START: 'session/start',
      SESSION_COMPLETE: 'session/complete',
      USER_COMPLETE_INSTALL: 'user/complete-install'
    }

    this.config = config
    this.runlog = runlog
    this.unseen = []
    this.seen = []
    this.noAds = false

    this.sessionId = undefined
  }

  haveApiKey () {
    return !!this.apiKey
  }

  getSeenAds () {
    return this.seen.slice()
  }

  async startSession (existingSessionId) {
    const { ads, sessionId } = await this.got.post(this.routes.SESSION_START, {
      json: { sessionId: existingSessionId }
    })
    // preserve session id in case we call the API again during this session
    this.sessionId = sessionId

    if (!ads || !ads.length) {
      this.runlog.debug('no ads returned from api, disabling ad fetching for rest of session')
      this.noAds = true
    }

    this.unseen.push(...ads || [])

    return (ads || []).length
  }

  async completeSession (sessionCompleteData) {
    const seenAdIds = this.seen.map(ad => ad.id)
    this.runlog.record(this.runlog.keys.SEEN_AD_IDS, seenAdIds)

    // we don't want a noisy error if this call fails
    try {
      await this.got.post(this.routes.SESSION_COMPLETE, {
        json: {
          sessionId: this.sessionId,
          seen: seenAdIds,
          ...sessionCompleteData
        }
      })
    } catch (e) {
      this.runlog.error('failed to complete session: %O', e)
    }
  }

  async getAd () {
    if (!this.unseen.length && !this.noAds) {
      this.runlog.debug('unseen ads list is empty, requesting more')
      try { // attempt to refresh this.unseen
        await this.startSession()
      } catch (_) {}
    }
    const ad = this.unseen.pop()
    if (!ad) {
      // no new ads from API, so recycle seen ads
      this.unseen.push(...this.seen)
    }
    if (ad) {
      this.seen.push(ad)
    }
    return ad
  }

  async getApiKey ({ token }) {
    const res = await this.got.post(this.routes.USER_COMPLETE_INSTALL, {
      json: { token }
    })
    return res.apiKey
  }
}

module.exports = ApiClient
