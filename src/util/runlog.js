const keys = {
  FB_VERSION: 'fbVersion',
  ARGUMENTS: 'arguments',
  SUPPORTED_PM: 'supportedPm',
  HAVE_API_KEY: 'haveApiKey',
  AUTH_FLOW_FAILED: 'authFlowFailed',
  INITIAL_AD_BATCH_SIZE: 'initialAdBatchSize',
  PM_CMD: 'pmCmd',
  SESSION_COMPLETE_DATA: 'sessionCompleteData',
  SEEN_AD_IDS: 'seenAdIds',
  EXIT_REASON: 'exitReason',
  PASSTHROUGH_MODE: 'passthrough',
  MANUALLY_DISABLED: 'manuallyDisabled'
}

// to get stringified errors
function replaceErrors (_, val) {
  if (val instanceof Error) {
    const error = {}
    Object.getOwnPropertyNames(val).forEach((prop) => {
      error[prop] = val[prop]
    })
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
    this.record(keys.EXIT_REASON, reason, true)
    const path = await this.tempWriter.write(JSON.stringify(this.records, replaceErrors))
    this.config.setLastRunlog(path)
  }
}

exports.keys = keys
exports.Runlog = Runlog
