const showAd = require('./showAd')
const auth = require('./auth')
const chalk = require('chalk')

function Ui (api, adInterval) {
  this.api = api
  this.interval = adInterval
}

Ui.prototype.startAds = async function startAds () {
  await showAd(() => this.api.fetchAd())
  setTimeout(this.startAds, this.interval)
}

Ui.prototype.auth = async function () {
  const { email } = await auth.getEmail()
  try {
    const res = await this.api.sendAuthEmail(email)
    if (!res.ok) throw new Error(`Could not request auth token email`)
  } catch (e) {
    console.error(
      chalk.red(
        // TODO make this error message accurate
        'Unable to request authentication token. Please email blah@blah.com for support.'
      )
    )
    return
  }
  const { token } = await auth.getAuthToken()
  return token
}

module.exports = Ui
