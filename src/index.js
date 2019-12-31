const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const Pm = require('./pm')
const Args = require('./args')
const Alias = require('./util/alias')

module.exports = async () => {
  const config = new Config()
  const api = new Api({ config })
  const alias = new Alias({ config })
  const pm = new Pm()
  const ui = new Ui()
  const args = new Args({ api, ui, config, alias })
  const exit = (e) => {
    process.exit(e ? 1 : 0)
  }

  const { hasArgs } = args.init()

  const { supportedPm, adsPm, noAdsPm } = await pm.init()

  if (!supportedPm && !hasArgs) {
    ui.error('Flossbank: unsupported package manager.')
    process.exit(1)
  }

  if (!pm.shouldShowAds() && !hasArgs) {
    return noAdsPm(exit)
  }

  const haveApiKey = config.getApiKey()

  if (hasArgs) return args.act()

  if (!haveApiKey) {
    const apiKey = await ui.authenticate({ haveApiKey, sendAuthEmail: api.sendAuthEmail.bind(api) })
    if (!apiKey) {
      // something went wrong with getting the key
      // pass control to pm and leave
      return noAdsPm(exit)
    }
    await config.setApiKey(apiKey)
  }

  api.setApiKey(config.getApiKey())

  api.setTopLevelPackages(await pm.getTopLevelPackages())

  ui.setPmCmd(pm.getPmCmd())
    .setCallback(async () => {
      try {
        await api.completeSession()
      } catch (_) {}
    })
    .startAds({ fetchAd: api.fetchAd.bind(api) })

  adsPm((e, stdout, stderr) => {
    ui.setPmOutput(e, stdout, stderr)
  })
}
