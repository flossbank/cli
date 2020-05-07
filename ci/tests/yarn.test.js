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

test.serial('integ: yarn: using package.json run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['yarn'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.wrap, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'yarn')
  t.true(runlog.seenAdIds.length > 0)
})

test.serial('integ: yarn: package.json silent mode', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['yarn', 'install', '--silent'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.every(dep => nodeModules.includes(dep)))

  t.is(runlog.silent, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'yarn install --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
})

test.serial('integ: yarn: specific package silent mode', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['yarn', 'add', 'js-deep-equals', '--silent'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.includes('js-deep-equals'))

  t.is(runlog.silent, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'yarn add js-deep-equals --silent')
  t.true(runlog.seenAdIds.length === 0) // no ads
})

test.serial('integ: yarn: specific package run pm with ads', async (t) => {
  await flossbank.config.setIntegApiKey()
  const runlog = await flossbank.run(['yarn', 'add', 'js-deep-equals'])

  const nodeModules = nodeUtils.getNodeModules()
  t.log('installed node modules:', nodeModules)
  t.true(t.context.testNodeDeps.includes('js-deep-equals'))

  t.is(runlog.wrap, true)
  t.is(runlog.supportedPm, true)
  t.is(runlog.pmCmd, 'yarn add js-deep-equals')
  t.true(runlog.seenAdIds.length > 0)
})
