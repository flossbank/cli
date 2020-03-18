/* eslint-disable */
const test = require('ava')
const path = require('path')
const { promisify } = require('util')
const { execFile } = require('child_process')
const { readFile } = require('fs')
const rimraf = require('rimraf')
const ls = require('ls')
const Config = require('../../src/config')
const testPkgJson = require('./package.json')

const testNodeDeps = Object.keys(testPkgJson.dependencies)

const rm = promisify(rimraf)

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'
const config = new Config()

let pythonDepDir

function setIntegApiKey () {
  return config.setApiKey(INTEG_TEST_KEY)
}

function setInvalidApiKey () {
  return config.setApiKey('very-invalid-api-key')
}

function getBinPath () {
  return path.resolve(process.cwd(), '../../', 'bin.js')
}

async function deleteInstalledDeps () {
  if (!pythonDepDir) {
    pythonDepDir = await resolvePythonDepDir()
  }
  return Promise.all([
    rm('node_modules'),
    rm(`${pythonDepDir}/*`)
  ])
}

async function getNodeModules () {
  return ls('./node_modules/*').map(dir => dir.name)
}

function resolvePythonDepDir () {
  return new Promise((resolve, reject) => {
    execFile('python', ['-m', 'site', '--user-site'], (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

async function getPythonPackages () {
  if (!pythonDepDir) {
    pythonDepDir = await resolvePythonDepDir()
  }
  return ls(`${pythonDepDir}/*`).map(dir => dir.name)
}

function runFlossbank (args) {
  return new Promise((resolve, reject) => {
    execFile('node', [getBinPath()].concat(args), (err, stdout) => {
      if (err) return reject(err)
      resolve(stdout.trim())
    })
  })
}

function getLastRunlog () {
  return new Promise((resolve, reject) => {
    execFile('node', [getBinPath(), 'runlog'], (err, stdout) => {
      if (err) return reject(err)
      if (!stdout) return reject(Error('no runlog found'))
      readFileAsync(stdout.trim()).then((data) => resolve(JSON.parse(data)))
    })
  })
}

function readFileAsync (...args) {
  return new Promise((resolve, reject) => {
    readFile(...args, (err, data) => {
      if (err) return reject(err)
      resolve(data)
    })
  })
}

test.before(() => {
  process.chdir(__dirname)
})

test.afterEach(async (t) => {
  // delete node modules and other deps from the test dir so that we can assert their presence during tests
  await deleteInstalledDeps()
  t.log('node modules empty:', await getNodeModules())
  t.log('python modules empty:', await getPythonPackages())
})

test.after.always((t) => {
  process.chdir(path.resolve(__dirname, '..'))
})

test.serial('integ: run pm with ads (npm)', async (t) => {
  await setIntegApiKey()
  await runFlossbank(['npm', 'install'])
  const nodeModules = await getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial.only('integ: run pm with ads (pip)', async (t) => {
  await setIntegApiKey()
  await runFlossbank(['pip', 'install', 'simplejson', '--user'])
  const pythonPackages = await getPythonPackages()
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'pip install simplejson --user')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: run in passthru mode when auth fails', async (t) => {
  await setInvalidApiKey()
  await runFlossbank(['npm', 'install'])
  const nodeModules = await getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.true(runlog.passthrough)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)

  t.context.deletedNodeModules = true
})

test.serial('integ: install to shell profiles', async (t) => {
  await runFlossbank(['install'])

  const runlog = await getLastRunlog()
  t.deepEqual(runlog.arguments, { hasArgs: true, install: true })
  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFileAsync(profile)))

  t.true(profiles.every(profile => profile.includes('flossbank_aliases')))
})

test.serial('integ: uninstall from shell profiles', async (t) => {
  await runFlossbank(['uninstall'])

  const runlog = await getLastRunlog()
  t.deepEqual(runlog.arguments, { hasArgs: true, uninstall: true })
  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => readFileAsync(profile)))

  t.true(profiles.every(profile => !profile.includes('flossbank_aliases')))
})
