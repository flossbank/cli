const path = require('path')
const {
  fs: { readFile },
  exec,
  constants: { INTEG_TEST_KEY, INTEG_TEST_HOST }
} = require('./_common')
const Config = require('../../../src/config')

const config = new Config()

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
    const runFn = process.env.FLOSSBANK_TEST_SOURCE
      ? (_args) => exec('node', [path.resolve(process.cwd(), '../../src')].concat(_args))
      : (_args) => exec(path.resolve(process.cwd(), '../../', 'flossbank'), _args)

    await runFn(args)
    const { stdout } = await runFn(['runlog'])
    const runlog = await readFile(stdout.trim())
    return JSON.parse(runlog)
  }
}
