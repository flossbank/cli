const test = require('ava')
const sinon = require('sinon')
const auth = require('../../src/args/auth')

test.beforeEach((t) => {
  const config = {
    setApiKey: sinon.stub()
  }
  const runlog = {
    error: sinon.stub(),
    record: sinon.stub(),
    keys: {}
  }
  const client = {
    getApiKey: sinon.stub()
  }
  const ui = {
    stdout: { write: sinon.stub() },
    error: sinon.stub()
  }
  t.context.deps = { config, client, runlog, ui }
})

test('sets api key', async (t) => {
  const { deps } = t.context

  deps.client.getApiKey.resolves('api-key')

  t.is(await auth(deps, ['auth-token']), 0)

  t.true(deps.config.setApiKey.calledWith('api-key'))
})

test('fails if api call fails', async (t) => {
  const { deps } = t.context

  deps.client.getApiKey.rejects()

  t.is(await auth(deps, ['auth-token']), 1)

  t.true(deps.config.setApiKey.notCalled)
})

test('fails if no token', async (t) => {
  const { deps } = t.context

  deps.client.getApiKey.rejects()

  t.is(await auth(deps), 1)

  t.true(deps.config.setApiKey.notCalled)
})
