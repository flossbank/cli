const test = require('ava')
const sinon = require('sinon')
const unwrap = require('../../src/args/unwrap')

test.beforeEach((t) => {
  const alias = {
    unaliasAllSupportedPackageManagers: sinon.stub(),
    unaliasPackageManager: sinon.stub()
  }
  const ui = {
    error: sinon.stub(),
    stdout: { write: sinon.stub() }
  }
  const runlog = {
    error: sinon.stub()
  }
  t.context.deps = { ui, alias, runlog }
})

test('specific pm gets unwrapped', async (t) => {
  const { deps } = t.context

  t.is(await unwrap(deps, ['npm']), 0)
  t.true(deps.alias.unaliasPackageManager.calledWith('npm'))
})

test('all pms get unwrapped if no input', async (t) => {
  const { deps } = t.context

  t.is(await unwrap(deps, []), 0)
  t.true(deps.alias.unaliasAllSupportedPackageManagers.calledOnce)
})

test('all pms get unwrapped if all is input', async (t) => {
  const { deps } = t.context

  t.is(await unwrap(deps, ['all']), 0)
  t.true(deps.alias.unaliasAllSupportedPackageManagers.calledOnce)
})

test('catches errors', async (t) => {
  const { deps } = t.context

  deps.alias.unaliasAllSupportedPackageManagers.throws(new Error('the worst'))

  t.is(await unwrap(deps, []), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
})
