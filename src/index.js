const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const Pm = require('./pm')
const Args = require('./args')
const Alias = require('./util/alias')
const debug = require('debug')('flossbank')

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

  debug('initializing arguments')
  const { hasArgs } = args.init()
  debug('have arguments: %o', !!hasArgs)

  debug('initializing package manager')
  const { supportedPm, adsPm, noAdsPm } = await pm.init()
  debug('supportedPm: %o', supportedPm)

  if (!supportedPm && !hasArgs) {
    debug('unsupported pm and no arguments; exiting')
    ui.error('Flossbank: unsupported package manager.')
    process.exit(1)
  }

  if (!pm.shouldShowAds() && !hasArgs) {
    debug('no args and pm determined we should not show ads; running in passthru mode')
    return noAdsPm(exit)
  }

  if (process.env.FLOSSBANK_DISABLE) {
    debug('flossbank manually disabled; running in passthru mode')
    return noAdsPm(exit)
  }

  const haveApiKey = config.getApiKey()

  if (hasArgs) {
    debug('have flossbank-specific args; running args logic')
    return args.act()
  }

  if (!haveApiKey) {
    debug('have no api key from config; running authentication flow')
    const apiKey = await ui.authenticate({ haveApiKey, sendAuthEmail: api.sendAuthEmail.bind(api) })
    if (!apiKey) {
      debug('did not get a valid api key back from authentication flow; running in passthru mode')
      // something went wrong with getting the key
      // pass control to pm and leave
      return noAdsPm(exit)
    }
    await config.setApiKey(apiKey)
    debug('persisted api key in config')
  }

  let initialAdBatchSize = 0
  try {
    const topLevelPackages = await pm.getTopLevelPackages()
    const registry = await pm.getRegistry()
    const language = await pm.getLanguage()

    debug('setting top-level packages: %O', topLevelPackages)
    debug('setting registry to %O', registry)
    debug('setting language to %O', language)
    initialAdBatchSize = await api
      .setTopLevelPackages(topLevelPackages)
      .setRegistry(registry)
      .setLanguage(language)
      .fetchAdBatch()
  } catch (e) {
    debug('failed to fetch initial ad batch; running in passthru mode: %O', e)
    return noAdsPm(exit)
  }

  if (initialAdBatchSize < 1) {
    debug('api returned empty list of ads; running in passthru mode')
    return noAdsPm(exit)
  }

  ui.setPmCmd(pm.getPmCmd())
    .setCallback(async () => {
      try {
        debug('completing ad viewing session')
        await api.completeSession()
      } catch (e) {
        debug('failed to complete session: %O', e)
      }
    })
    .startAds({ fetchAd: api.fetchAd.bind(api) })

  debug('running package manager with ads')
  adsPm((e, stdout, stderr) => {
    debug('package manager execution complete')
    ui.setPmOutput(e, stdout, stderr)
  })
}
