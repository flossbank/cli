const path = require('path')
const { execFile } = require('child_process')
const { readFile } = require('fs')
const { promisify } = require('util')
const ls = require('ls')
const rimraf = require('rimraf')
const Config = require('../../src/config')

const rm = promisify(rimraf)

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'
const config = new Config()

exports.setIntegApiKey = function setIntegApiKey () {
  return config.setApiKey(INTEG_TEST_KEY)
}

exports.setInvalidApiKey = function setInvalidApiKey () {
  return config.setApiKey('very-invalid-api-key')
}

exports.getBinPath = function getBinPath () {
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
