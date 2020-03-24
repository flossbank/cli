const path = require('path')
const { execFile } = require('child_process')
const { readFile } = require('fs')
const { promisify } = require('util')
const ls = require('ls')
const rimraf = require('rimraf')
const Config = require('../../src/config')

const rm = promisify(rimraf)

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'
const INTEG_TEST_HOST = 'https://api.flossbank.io'
const DEFAULT_HOST = 'https://api.flossbank.com'
const config = new Config()

let backupApiKey

exports.setIntegApiKey = async function setIntegApiKey () {
  if (!backupApiKey) {
    backupApiKey = config.getApiKey()
  }
  config.setApiKey(INTEG_TEST_KEY)
  config.setApiHost(INTEG_TEST_HOST)
}

exports.resetConfig = async function resetConfig () {
  if (backupApiKey) {
    config.setApiKey(backupApiKey)
  }
  config.setApiHost(DEFAULT_HOST)
}

exports.setInvalidApiKey = async function setInvalidApiKey () {
  if (!backupApiKey) {
    backupApiKey = config.getApiKey()
  }
  config.setApiKey('very-invalid-api-key')
  config.setApiHost(INTEG_TEST_HOST)
}

exports.getBinPath = function getBinPath () {
  if (process.env.FLOSSBANK_TEST_SOURCE) {
    return path.resolve(process.cwd(), '../../src', 'bin.js')
  }
  return path.resolve(process.cwd(), '../../', 'bin.js')
}

exports.deleteInstalledDeps = async function deleteInstalledDeps (pythonDepDir) {
  return Promise.all([
    rm('node_modules'),
    rm(`${pythonDepDir}/*`)
  ])
}

exports.getNodeModules = async function getNodeModules () {
  return ls('./node_modules/*').map(dir => dir.name)
}

exports.resolvePythonDepDir = function resolvePythonDepDir () {
  return new Promise((resolve, reject) => {
    execFile('python', ['-m', 'site', '--user-site'], (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

exports.getPythonPackages = async function getPythonPackages (pythonDepDir) {
  return ls(`${pythonDepDir}/*`).map(dir => dir.name)
}

exports.runFlossbank = function runFlossbank (args) {
  return new Promise((resolve, reject) => {
    execFile('node', [exports.getBinPath()].concat(args), (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

exports.getLastRunlog = function getLastRunlog () {
  return new Promise((resolve, reject) => {
    execFile('node', [exports.getBinPath(), 'runlog'], (err, stdout) => {
      if (err) return reject(err)
      if (!stdout) return reject(Error('no runlog found'))
      exports.readFileAsync(stdout.trim()).then((data) => resolve(JSON.parse(data)))
    })
  })
}

exports.readFileAsync = function readFileAsync (...args) {
  return new Promise((resolve, reject) => {
    readFile(...args, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}
