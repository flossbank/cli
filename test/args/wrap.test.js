const test = require('ava')
const sinon = require('sinon')
const wrap = require('../../src/args/wrap')

test.beforeEach((t) => {
  const alias = {
    isSupportedPm: sinon.stub().returns(true),
    aliasAllSupportedPackageManagers: sinon.stub(),
    aliasPackageManager: sinon.stub()
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

test('specific pm gets wrapped', async (t) => {
  const { deps } = t.context

  t.is(await wrap(deps, ['npm']), 0)
  t.true(deps.alias.aliasPackageManager.calledWith('npm'))
})

test('unsupported pm throws', async (t) => {
  const { deps } = t.context

  deps.alias.isSupportedPm.returns(false)

  t.is(await wrap(deps, ['asdf']), 1)
  t.true(deps.alias.aliasPackageManager.notCalled)
})

test('all pms get wrapped if no input', async (t) => {
  const { deps } = t.context

  t.is(await wrap(deps, []), 0)
  t.true(deps.alias.aliasAllSupportedPackageManagers.calledOnce)
})

test('all pms get wrapped if all is input', async (t) => {
  const { deps } = t.context

  t.is(await wrap(deps, ['all']), 0)
  t.true(deps.alias.aliasAllSupportedPackageManagers.calledOnce)
})

test('catches errors (all)', async (t) => {
  const { deps } = t.context

  deps.alias.aliasAllSupportedPackageManagers.throws(new Error('the worst'))

  t.is(await wrap(deps), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
})

test('catches errors (specific)', async (t) => {
  const { deps } = t.context

  deps.alias.aliasPackageManager.throws(new Error('the worst'))

  t.is(await wrap(deps, ['npm']), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
})
