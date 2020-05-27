const debug = require('debug')('flossbank:update')
const Config = require('../config')
const Runlog = require('../util/runlog')
const tempWriter = require('../util/temp')
const Update = require('.')

const config = new Config()
const runlog = new Runlog({ config, tempWriter, debug })
const update = new Update({ config, tempWriter, runlog })

async function check () {
  try {
    await update.check()
  } catch (_) {} // this file runs completely invisibly, so swallowing all errors
}

check()
