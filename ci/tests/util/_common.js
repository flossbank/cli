const { execFile } = require('child_process')
const { promises: { readFile } } = require('fs')
const { promisify } = require('util')
const ls = require('ls')
const rimraf = require('rimraf')

const rm = promisify(rimraf)
const exec = promisify(execFile)

module.exports = {
  sleep: (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms)),
  fs: { ls, rm, readFile },
  exec,
  constants: {
    INTEG_TEST_KEY: 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1',
    INTEG_TEST_TOKEN: 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1',
    INTEG_TEST_HOST: 'https://api.flossbank.io',
    DEFAULT_HOST: 'https://api.flossbank.com'
  }
}
