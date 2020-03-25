const test = require('ava')
const { fs: { readFileAsync } } = require('./util/_common')
const flossbank = require('./util/_flossbank')
const pythonUtils = require('./util/_python')

test.before(async (t) => {
  t.context.testPythonDeps = (await readFileAsync('./requirements.txt', { encoding: 'utf8' }))
    .split('\n')
    .map(spec => spec.split('=').shift()) // simplejson==3.17.0 => simplejson
})

test.afterEach('delete installed python packages', async (t) => {
  await pythonUtils.deletePythonPkgs()
  t.log('node modules empty:', await pythonUtils.getPythonPkgs())
})

test.serial('integ: pip: with requirements file run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['pip', 'install', '-r', 'requirements.txt', '--user'])

  const pythonPackages = await pythonUtils.getPythonPkgs()
  t.log('installed python packages:', pythonPackages)
  t.true(t.context.testPythonDeps.every(dep => pythonPackages.includes(dep)))

  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'pip install -r requirements.txt --user')
  t.is(runlog.passthrough, false)
  t.true(runlog.seenAdIds.length > 0)
})

test.serial('integ: pip: with specific package run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['pip', 'install', 'simplejson', '--user'])

  const pythonPackages = await pythonUtils.getPythonPkgs()
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'pip install simplejson --user')
  t.is(runlog.passthrough, false)
  t.true(runlog.seenAdIds.length > 0)
})

test.serial('integ: pip: run in passthru mode with invalid pip args', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['pip', 'install', '-r']) // no requirements file specified

  const pythonPackages = await pythonUtils.getPythonPkgs()
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.length === 0)

  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'pip install -r')
  t.is(runlog.passthrough, true)
})

test.serial('integ: pip: run in passthru mode when auth fails', async (t) => {
  await flossbank.config.setInvalidApiKey()
  const runlog = await flossbank.run(['pip', 'install', 'simplejson', '--user'])

  const pythonPackages = await pythonUtils.getPythonPkgs()
  t.log('installed python packages:', pythonPackages)
  t.true(pythonPackages.includes('simplejson'))

  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'pip install simplejson --user')
  t.is(runlog.passthrough, true)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)
})
