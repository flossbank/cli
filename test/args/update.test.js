const test = require('ava')
const sinon = require('sinon')
const up = require('../../src/args/update')

test.beforeEach((t) => {
  const update = {
    getLatestVersion: sinon.stub(),
    update: sinon.stub()
  }
  const ui = {
    dots: sinon.stub().returns(() => {}),
    info: sinon.stub(),
    error: sinon.stub(),
    stdout: { write: sinon.stub() }
  }
  const runlog = {
    error: sinon.stub()
  }
  t.context.deps = { ui, runlog, update }
})

test('bails if no new version', async (t) => {
  const { deps } = t.context
  deps.update.getLatestVersion.resolves({ shouldUpdate: false, latestVersion: '0.0.1' })
  t.is(await up(deps), 0)

  t.true(deps.update.update.notCalled)
})

test('errors if version check fails', async (t) => {
  const { deps } = t.context
  deps.update.getLatestVersion.rejects(new Error())
  t.is(await up(deps), 1)

  t.true(deps.update.update.notCalled)
})

test('updates if new version is available', async (t) => {
  const { deps } = t.context
  deps.update.getLatestVersion.resolves({ shouldUpdate: true, latestVersion: '0.0.1' })

  t.is(await up(deps), 0)

  t.true(deps.update.update.calledOnce)
})

test('errors if update fails', async (t) => {
  const { deps } = t.context
  deps.update.getLatestVersion.resolves({ shouldUpdate: true, latestVersion: '0.0.1' })
  deps.update.update.rejects(new Error())

  t.is(await up(deps), 1)
  t.true(deps.update.update.calledOnce)
})
