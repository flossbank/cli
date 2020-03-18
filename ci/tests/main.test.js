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
})

test.serial('integ: npm: run pm with ads', async (t) => {
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

test.serial('integ: pip: run pm with ads', async (t) => {
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
