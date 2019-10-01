const showAd = require('./showAd')

function Ui (api, adInterval) {
  this.api = api
  this.interval = adInterval
}

Ui.prototype.startAds = async function startAds () {
  await showAd(() => this.api.fetchAd())
  setTimeout(this.startAds, this.interval)
}

module.exports = Ui
