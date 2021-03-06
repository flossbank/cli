
const { version } = require('../package.json')

const exit = (runlog, reason, code) => {
  runlog.write(reason).then(() => { process.exit(code || 0) })
}

const resolveSessionData = async (sessionData, runlog) => {
  try {
    const [packages, registry, language, pmVersion, flossbankVersion] = await Promise.all(sessionData)
    const sessionCompleteData = {
      packages,
      registry,
      language,
      metadata: {
        packageManagerVersion: pmVersion,
        flossbankVersion
      }
    }
    runlog.record(runlog.keys.SESSION_COMPLETE_DATA, sessionCompleteData)

    return sessionCompleteData
  } catch (e) {
    runlog.error('failed to resolve session data: %O', e)
    return {}
  }
}

module.exports = async ({ runlog, client, pm, ui, args }) => {
  runlog.record(runlog.keys.FB_VERSION, version)

  if (args.haveArgs()) {
    const exitCode = await args.act()
    return exit(runlog, 'flossbank args', exitCode)
  }

  if (!pm.supportedPm) {
    ui.error('Flossbank: unsupported package manager.')
    return exit(runlog, 'unsupported package manager', 1)
  }

  if (!pm.isSupportedVerb()) {
    runlog.record(runlog.keys.PASSTHROUGH_MODE, true)
    return pm.passthrough((err, code) => exit(runlog, err ? err.toString() : 'unsupported verb', code))
  }

  if (!client.haveApiKey()) {
    runlog.record(runlog.keys.PASSTHROUGH_MODE, true)
    return pm.passthrough((err, code) => exit(runlog, err ? err.toString() : 'no api key', code))
  }

  let initialAdBatchSize = 0
  try {
    initialAdBatchSize = await client.startSession()
  } catch (e) {
    runlog.error('failed to start session: %O', e)
    runlog.record(runlog.keys.PASSTHROUGH_MODE, true)
    return pm.passthrough((err, code) => exit(runlog, err ? err.toString() : 'failed to start session', code))
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

  // if not in a TTY, we won't display ads (unless we're debugging, which is what runlog.enabled means)
  const inATerminalOrDebugging = process.stdout.isTTY || runlog.enabled

  if (initialAdBatchSize < 1 || pm.isQuietMode() || !inATerminalOrDebugging) {
    // we will not start the UI, but we will "complete" this is no-ads session
    runlog.record(runlog.keys.SILENT_MODE, true)
    return pm.passthrough(async (err, code) => {
      if (err) ui.error(err)
      const sessionCompleteData = await resolveSessionData(sessionData, runlog)
      await client.completeSession(sessionCompleteData)
      ui.sayGoodbye()
      exit(runlog, err, code)
    })
  }

  // start the pm and the ads ui
  runlog.record(runlog.keys.WRAP_MODE, true)
  pm.start((err, { stdout, stderr, exit, code }) => {
    if (exit) {
      runlog.debug('package manager execution complete')
      ui.setPmDone(code)
    } else {
      ui.setPmOutput(err, stdout, stderr)
    }
  })
  await ui.startAds({ pmCmd: pm.getPmCmd() })

  const sessionCompleteData = await resolveSessionData(sessionData, runlog)
  await client.completeSession(sessionCompleteData)
  ui.printSummary()
  ui.sayGoodbye()

  exit(runlog, 'success')
}
