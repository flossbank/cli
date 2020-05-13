const test = require('ava')
const sinon = require('sinon')
const runlog = require('../../src/args/runlog')

test.beforeEach((t) => {
  const ui = {
    stdout: { write: sinon.stub() }
  }
  const config = {
    getLastRunlog: sinon.stub()
  }
  t.context.deps = { ui, config }
})

test('prints runlog and exits 0', (t) => {
  const { deps } = t.context
  deps.config.getLastRunlog.returns('last-runlog')
  t.is(runlog(deps), 0)
  t.true(deps.ui.stdout.write.calledWith('last-runlog\n'))
})
