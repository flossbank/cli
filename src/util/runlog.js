const keys = {
  FB_VERSION: 'fbVersion',
  PASSTHROUGH_MODE: 'passthrough',
  WRAP_MODE: 'wrap',
  SILENT_MODE: 'silent',
  EXIT_REASON: 'exitReason',

  // pm
  SUPPORTED_PM: 'supportedPm',
  PM_CMD: 'pmCmd',

  // auth
  HAVE_API_KEY: 'haveApiKey',
  NEW_API_KEY_SET: 'newApiKeySet',
  AUTH_FLOW_FAILED: 'authFlowFailed',

  // session
  SESSION_COMPLETE_DATA: 'sessionCompleteData',
  SEEN_AD_IDS: 'seenAdIds',

  // profile
  DETECTED_SHELL_PROFILES: 'detectedShellFormatProfiles',
  DETECTED_POWER_PROFILES: 'detectedPowerFormatProfiles'
}

// to get stringified errors
function replaceErrors (_, val) {
  if (val instanceof Error) {
    const error = {}
    const props = ['message', 'stack']
    props.forEach((prop) => { error[prop] = val[prop] })
    return error
  }
  return val
}

class Runlog {
  constructor ({ config, debug, tempWriter }) {
    this.records = { errors: [] }
    this.config = config
    this.debugger = debug
    this.tempWriter = tempWriter
    this.keys = keys

    this.records.startTime = Date.now()
  }

  get enabled () {
    return this.debugger.enabled
  }

  record (key, val, silent) {
    this.records[key] = val
    if (!silent) this.debug(`${key}: %O`, val)
  }

  error (msg, err) {
    this.debug(msg, err)
    this.records.errors.push(err)
  }

  debug (...args) {
    this.debugger(...args)
  }

  async write (reason) {
    if (!this.enabled) return
    this.record('exitReason', reason)
    this.record('endTime', Date.now())
    const path = await this.tempWriter.write(JSON.stringify(this.records, replaceErrors))
    this.config.setLastRunlog(path)
  }
}

module.exports = Runlog
