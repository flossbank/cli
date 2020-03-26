const path = require('path')
const {
  fs: { readFileAsync },
  exec,
  constants: { INTEG_TEST_KEY, INTEG_TEST_HOST }
} = require('./_common')
const Config = require('../../../src/config')

const config = new Config()

function getBinPath () {
  if (process.env.FLOSSBANK_TEST_SOURCE) {
    return path.resolve(process.cwd(), '../../src', 'bin.js')
  }
  return path.resolve(process.cwd(), '../../', 'bin.js')
}

// utilities to aid in configuring and running FB and collecting logs
module.exports = {
  config: {
    setIntegApiKey: async function () {
      config.setApiKey(INTEG_TEST_KEY)
      config.setApiHost(INTEG_TEST_HOST)
    },
    setInvalidApiKey: async function () {
      config.setApiKey('very-invalid-api-key')
      config.setApiHost(INTEG_TEST_HOST)
    },
    clearApiKey: async function () {
      config.setApiKey('')
      config.setApiHost(INTEG_TEST_HOST)
    },
    getApiKey: () => config.getApiKey(),
    setAuthOverrides: (overrides) => config.setAuthOverrides(overrides)
  },
  run: async function (args) {
    await exec('node', [getBinPath()].concat(args))
    const { stdout } = await exec('node', [getBinPath(), 'runlog'])
    const runlog = await readFileAsync(stdout.trim())
    return JSON.parse(runlog)
  }
}
