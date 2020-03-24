const debug = require('debug')('flossbank')
const Api = require('./api')
const Config = require('./config')
const Ui = require('./ui')
const Pm = require('./pm')
const Args = require('./args')
const Alias = require('./alias')
const Profile = require('./profile')
const TempWriter = require('./util/temp')
const { Runlog, keys } = require('./util/runlog')
const { version } = require('../package.json')

module.exports = async () => {
  const config = new Config()
  const tempWriter = new TempWriter()
  const runlog = new Runlog({ config, debug, tempWriter })
  const api = new Api({ config, runlog })
  const alias = new Alias({ config })
  const profile = new Profile({ alias, runlog })
  const pm = new Pm({ runlog })
  const ui = new Ui({ runlog })
  const args = new Args({ api, ui, config, alias, profile, runlog })
  const exit = (reason, code) => {
    runlog.write(reason).then(() => { process.exit(code || 0) })
  }

  runlog.record(keys.FB_VERSION, version)

  runlog.debug('initializing arguments')
  const parsedArgs = args.init()
  const { hasArgs } = parsedArgs
  runlog.record(keys.ARGUMENTS, parsedArgs)

  runlog.debug('initializing package manager')
  const { supportedPm, adsPm, noAdsPm } = await pm.init()
  runlog.record(keys.SUPPORTED_PM, supportedPm)
  const pmCmd = pm.getPmCmd()
  runlog.record(keys.PM_CMD, pmCmd)

  if (!supportedPm && !hasArgs) {
    runlog.debug('unsupported pm and no arguments; exiting')
    ui.error('Flossbank: unsupported package manager.')
    return exit('unsupported package manager', 1)
  }

  if (!pm.shouldShowAds() && !hasArgs) {
    runlog.debug('no args and pm determined we should not show ads')
    runlog.record(keys.PASSTHROUGH_MODE, true)
    return noAdsPm(() => exit())
  }

  if (process.env.FLOSSBANK_DISABLE) {
    runlog.record(keys.MANUALLY_DISABLED, true)
    return noAdsPm(() => exit())
  }

  const apiKey = config.getApiKey()
  runlog.record(keys.HAVE_API_KEY, !!apiKey)

  if (hasArgs) {
    runlog.debug('have flossbank-specific args; running args logic')
    await args.act()
    return exit()
  }

  if (!apiKey) {
    const newApiKey = await ui.authenticate({
      haveApiKey: !!apiKey,
      sendAuthEmail: api.sendAuthEmail.bind(api),
      checkAuth: api.checkAuth.bind(api)
    })
    if (!newApiKey) {
      runlog.record(keys.AUTH_FLOW_FAILED, true)
      runlog.record(keys.PASSTHROUGH_MODE, true)
      // something went wrong with getting the key
      // pass control to pm and leave
      return noAdsPm(() => exit())
    }
    await config.setApiKey(apiKey)
    runlog.debug('persisted api key in config')
  }

  let initialAdBatchSize = 0
  let initialError = null
  try {
    const { newAds, error } = await api.fetchAdBatch()
    runlog.record(keys.INITIAL_AD_BATCH_SIZE, newAds)

    initialError = error
    initialAdBatchSize = newAds
  } catch (e) {
    runlog.error('failed to fetch initial ad batch %O', e)
    runlog.record(keys.PASSTHROUGH_MODE, true)
    return noAdsPm(() => exit())
  }

  if (initialError) {
    runlog.record(keys.PASSTHROUGH_MODE, true)
    return noAdsPm(() => exit())
  }

  let sessionData
  try {
    sessionData = [
      pm.getTopLevelPackages(),
      pm.getRegistry(),
      pm.getLanguage(),
      pm.getVersion(),
      version
    ]
  } catch (e) {
    runlog.error('failed to get session data: %O', e)
  }

  if (initialAdBatchSize < 1 || pm.isQuietMode()) {
    runlog.record(keys.PASSTHROUGH_MODE, false)
    // we will not start the UI; this is an no-ads session
    return noAdsPm(async (err, code) => {
      if (err) console.error(err)
      await api.completeSession(sessionData)
      ui.sayGoodbye()
      exit(err, code)
    })
  }

  ui.setPmCmd(pmCmd)
    .setCallback(async () => {
      await api.completeSession(sessionData)
      exit()
    })
    .setFetchAd(async () => api.fetchAd())
    .setGetSeenAds(() => api.getSeenAds())
    .startAds()

  runlog.debug('running package manager with ads')
  runlog.record(keys.PASSTHROUGH_MODE, false)
  adsPm((err, { stdout, stderr, exit, code } = {}) => {
    if (exit) {
      runlog.debug('package manager execution complete')
      ui.setPmDone(code)
    } else {
      ui.setPmOutput(err, stdout, stderr)
    }
  })
}
