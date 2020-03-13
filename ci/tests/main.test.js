const test = require('ava')
const path = require('path')
const { execFile } = require('child_process')
const { readFile } = require('fs')
const rimraf = require('rimraf')
const ls = require('ls')
const Config = require('../../src/config')

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'
const config = new Config()

function setIntegApiKey () {
  return config.setApiKey(INTEG_TEST_KEY)
}

function setInvalidApiKey () {
  return config.setApiKey('very-invalid-api-key')
}

function getBinPath () {
  return path.resolve(process.cwd(), '../../', 'bin.js')
}

function deleteNpmArtifacts () {
  return new Promise((resolve, reject) => {
    rimraf('node_modules', (err) => {
      if (err) return reject(err)
      return resolve()
    })
  })
}

function getNodeModules () {
  return ls('./node_modules/*').map(dir => dir.name)
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
      readFile(stdout.trim(), (err2, data) => {
        if (err2) return reject(err2)
        resolve(JSON.parse(data))
      })
    })
  })
}

test.before(() => {
  process.chdir(__dirname)
})

test.afterEach(async (t) => {
  // delete node modules from the test dir so that we can assert their presence during tests
  await deleteNpmArtifacts()
  t.log('node modules empty:', getNodeModules())
})

test.after.always((t) => {
  process.chdir(path.resolve(__dirname, '..'))
})

test.serial('integ: run pm with ads', async (t) => {
  await setIntegApiKey()
  await runFlossbank(['npm', 'install'])
  const nodeModules = getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(nodeModules.length > 0)

  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: run in passthru mode when auth fails', async (t) => {
  await setInvalidApiKey()
  await runFlossbank(['npm', 'install'])
  const nodeModules = getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(nodeModules.length > 0)

  const runlog = await getLastRunlog()
  t.true(runlog.supportedPm)
  t.true(runlog.passthrough)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)
})
