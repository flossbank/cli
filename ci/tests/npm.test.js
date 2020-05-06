const test = require('ava')
const flossbank = require('./util/_flossbank')
const nodeUtils = require('./util/_node')
const testPkgJson = require('./package.json')

test.before((t) => {
  t.context.testNodeDeps = Object.keys(testPkgJson.dependencies)
})

test.afterEach('delete installed node modules', async (t) => {
  await nodeUtils.deleteNodeModules()
  t.log('node modules empty:', nodeUtils.getNodeModules())
})

test.serial('integ: npm: using package.json run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['npm', 'install'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.wrap, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'npm install')
  t.true(runlog.seenAdIds.length > 0)
})

test.serial('integ: npm: package.json quiet mode', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['npm', 'install', '--quiet'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.silent, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'npm install --quiet')
  t.true(runlog.seenAdIds.length === 0) // no ads
})

test.serial('integ: npm: package.json silent mode', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['npm', 'install', '--silent'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.silent, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'npm install --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
})

test.serial('integ: npm: specific package silent mode', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['npm', 'install', 'js-deep-equals', '--silent'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.includes('js-deep-equals'))

  t.is(runlog.silent, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'npm install js-deep-equals --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
})

test.serial('integ: npm: specific package run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['npm', 'install', 'js-deep-equals'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.includes('js-deep-equals'))

  t.is(runlog.wrap, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'npm install js-deep-equals')
  t.true(runlog.seenAdIds.length > 0)
})

test.serial.only('integ: npm: run in passthru mode when auth fails', async (t) => {
  await flossbank.config.setInvalidApiKey()
  const runlog = await flossbank.run(['npm', 'install'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.supportedPm, true)
  t.is(runlog.passthrough, true)
  t.is(runlog.errors.length, 1) // only 1 error (authentication)
})
