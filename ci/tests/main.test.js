const test = require('ava')
const path = require('path')
const util = require('./_util')

const testPkgJson = require('./package.json')

const testNodeDeps = Object.keys(testPkgJson.dependencies)

test.before(async (t) => {
  process.chdir(__dirname)

  t.context.pythonDepDir = await util.resolvePythonDepDir()
})

test.afterEach(async (t) => {
  // delete node modules and other deps from the test dir so that we can assert their presence during tests
  await util.deleteInstalledDeps(t.context.pythonDepDir)
  t.log('node modules empty:', await util.getNodeModules())
  t.log('python modules empty:', await util.getPythonPackages(t.context.pythonDepDir))
})

test.after.always(() => {
  process.chdir(path.resolve(__dirname, '..'))
  util.resetConfig()
})

test.serial('integ: npm: using package.json run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['npm', 'install'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: npm: package.json quiet mode', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['npm', 'install', '--quiet'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install --quiet')
  t.true(runlog.seenAdIds.length === 0) // no ads
  t.false(runlog.passthrough)
})

test.serial('integ: npm: package.json silent mode', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['npm', 'install', '--silent'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
  t.false(runlog.passthrough)
})

test.serial('integ: npm: specific package silent mode', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['npm', 'install', 'js-deep-equals', '--silent'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.includes('js-deep-equals'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install js-deep-equals --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
  t.false(runlog.passthrough)
})

test.serial('integ: npm: specific package run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['npm', 'install', 'js-deep-equals'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.includes('js-deep-equals'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'npm install js-deep-equals')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: npm: run in passthru mode when auth fails', async (t) => {
  await util.setInvalidApiKey()
  await util.runFlossbank(['npm', 'install'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.true(runlog.passthrough)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)
})

test.serial('integ: yarn: using package.json run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['yarn'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'yarn')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: yarn: package.json silent mode', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['yarn', 'install', '--silent'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.every(dep => nodeModules.includes(dep)))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'yarn install --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
  t.false(runlog.passthrough)
})

test.serial('integ: yarn: specific package silent mode', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['yarn', 'add', 'js-deep-equals', '--silent'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.includes('js-deep-equals'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'yarn add js-deep-equals --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
  t.false(runlog.passthrough)
})

test.serial('integ: yarn: specific package run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['yarn', 'add', 'js-deep-equals'])
  const nodeModules = await util.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(testNodeDeps.includes('js-deep-equals'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'yarn add js-deep-equals')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: pip: with requirements file run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['pip', 'install', '-r', 'requirements.txt', '--user'])
  const pythonPackages = await util.getPythonPackages(t.context.pythonDepDir)
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'pip install -r requirements.txt --user')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: pip: with specific package run pm with ads', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['pip', 'install', 'simplejson', '--user'])
  const pythonPackages = await util.getPythonPackages(t.context.pythonDepDir)
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'pip install simplejson --user')
  t.true(runlog.seenAdIds.length > 0)
  t.false(runlog.passthrough)
})

test.serial('integ: pip: run in passthru mode with invalid pip args', async (t) => {
  await util.setIntegApiKey()
  await util.runFlossbank(['pip', 'install', '-r']) // no requirements file specified
  const pythonPackages = await util.getPythonPackages(t.context.pythonDepDir)
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.length === 0)

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'pip install -r')
  t.true(runlog.passthrough)
})

test.serial('integ: pip: run in passthru mode when auth fails', async (t) => {
  await util.setInvalidApiKey()
  await util.runFlossbank(['pip', 'install', 'simplejson', '--user'])
  const pythonPackages = await util.getPythonPackages(t.context.pythonDepDir)
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  const runlog = await util.getLastRunlog()
  t.true(runlog.supportedPm)
  t.is(runlog.pmCmd, 'pip install simplejson --user')
  t.true(runlog.passthrough)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)
})

test.serial('integ: install to shell profiles', async (t) => {
  await util.runFlossbank(['install'])

  const runlog = await util.getLastRunlog()
  t.deepEqual(runlog.arguments, { hasArgs: true, install: true })
  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => util.readFileAsync(profile)))

  t.true(profiles.every(profile => profile.includes('flossbank_aliases')))
  t.log('after install all shell profiles were found sourcing flossbank aliases')
})

test.serial('integ: uninstall from shell profiles', async (t) => {
  await util.runFlossbank(['uninstall'])

  const runlog = await util.getLastRunlog()
  t.deepEqual(runlog.arguments, { hasArgs: true, uninstall: true })
  const profilePaths = [
    ...runlog.detectedShellFormatProfiles,
    ...runlog.detectedPowerFormatProfiles
  ]
  t.true(profilePaths.length > 0)
  t.log('profile paths:', profilePaths)
  const profiles = await Promise.all(profilePaths.map(profile => util.readFileAsync(profile)))

  t.true(profiles.every(profile => !profile.includes('flossbank_aliases')))
  t.log('after uninstall no shell profiles were found sourcing flossbank aliases')
})

test.serial('integ: auth flow successful', async (t) => {
  await util.clearApiKey()
  await util.setAuthOverrides({ email: util.INTEG_TEST_EMAIL, token: util.INTEG_TEST_KEY })
  await util.runFlossbank(['auth'])

  const runlog = await util.getLastRunlog()
  t.deepEqual(runlog.arguments, { hasArgs: true, auth: true })
  t.true(runlog.newApiKeySet)

  t.is(await util.getApiKey(), util.INTEG_TEST_KEY)
})
