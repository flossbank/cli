const test = require('ava')
const sinon = require('sinon')
const check = require('../../src/args/check')

test.beforeEach((t) => {
  t.context.config = {
    getApiKey: sinon.stub(),
    getApiHost: sinon.stub()
  }
  t.context.runlog = {
    debug: sinon.stub()
  }
})

test.serial('exit 0 when fully configured', (t) => {
  const { config, runlog } = t.context
  config.getApiHost.returns(true)
  config.getApiKey.returns(true)

  t.is(check({ config, runlog }), 0)
})

test.serial('exit 1 when no api key', (t) => {
  const { config, runlog } = t.context
  config.getApiHost.returns(true)
  config.getApiKey.returns(false)

  t.is(check({ config, runlog }), 1)
})

test.serial('exit 1 when no api host', (t) => {
  const { config, runlog } = t.context
  config.getApiHost.returns(false)
  config.getApiKey.returns(true)

  t.is(check({ config, runlog }), 1)
})
