const test = require('ava')
const sinon = require('sinon')
const help = require('../../src/args/help')

test.beforeEach((t) => {
  t.context.ui = {
    printHelp: sinon.stub()
  }
})

test('prints help and exits 0', (t) => {
  const { ui } = t.context
  t.is(help({ ui }), 0)
  t.true(ui.printHelp.calledOnce)
})
