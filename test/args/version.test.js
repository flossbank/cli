const test = require('ava')
const sinon = require('sinon')
const version = require('../../src/args/version')

test.beforeEach((t) => {
  t.context.ui = {
    printVersion: sinon.stub()
  }
})

test('shows version and exits 0', (t) => {
  const { ui } = t.context
  t.is(version({ ui }), 0)
  t.true(ui.printVersion.calledOnce)
})
