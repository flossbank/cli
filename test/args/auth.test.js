const test = require('ava')
const sinon = require('sinon')
const auth = require('../../src/args/auth')

test.beforeEach((t) => {
  const config = {
    setApiKey: sinon.stub()
  }
  const runlog = {
    record: sinon.stub(),
    keys: {}
  }
  const ui = {
    authenticate: sinon.stub()
  }
  t.context.deps = { config, runlog, ui }
})

test('sets api key', async (t) => {
  const { deps } = t.context

  deps.ui.authenticate.resolves('api-key')

  t.is(await auth(deps), 0)

  t.true(deps.config.setApiKey.calledWith('api-key'))
})

test('fails if auth flow fails', async (t) => {
  const { deps } = t.context

  deps.ui.authenticate.resolves()

  t.is(await auth(deps), 1)

  t.true(deps.config.setApiKey.notCalled)
})
