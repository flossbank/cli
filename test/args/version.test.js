const test = require('ava')
const sinon = require('sinon')
const version = require('../../src/args/version')

test.beforeEach((t) => {
  t.context.ui = {
    showVersion: sinon.stub()
  }
})

test('shows version and exits 0', (t) => {
  const { ui } = t.context
  t.is(version({ ui }), 0)
  t.true(ui.showVersion.calledOnce)
})
