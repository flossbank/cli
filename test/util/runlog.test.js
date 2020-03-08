const test = require('ava')
const sinon = require('sinon')
const debug = require('debug')
const { Runlog } = require('../../src/util/runlog')

test.beforeEach((t) => {
  t.context.config = {
    setLastRunlog: sinon.stub()
  }
  t.context.tempWriter = {
    write: sinon.stub().returns('/abc')
  }
  t.context.debug = debug('flossbank')
  t.context.debug.log = () => {}
  t.context.runlog = new Runlog({
    config: t.context.config,
    debug: t.context.debug,
    tempWriter: t.context.tempWriter
  })
})

test('record | updates records', (t) => {
  t.context.runlog.record('a', 'b')
  t.is(t.context.runlog.records.a, 'b')
})

test('error | updates recorded errors', (t) => {
  t.context.runlog.error('a', new Error('b'))
  t.deepEqual(t.context.runlog.records.errors, [new Error('b')])
})

test('write | does nothing when disabled', async (t) => {
  t.context.runlog.record('a', 'b')
  await t.context.runlog.write()
  t.true(t.context.config.setLastRunlog.notCalled)
  t.true(t.context.tempWriter.write.notCalled)
})

test('write | updates config', async (t) => {
  t.context.runlog.debugger.enabled = true
  t.context.runlog.record('a', 'b')
  await t.context.runlog.write()
  t.true(t.context.config.setLastRunlog.calledOnce)
  t.deepEqual(t.context.tempWriter.write.lastCall.args, [
    JSON.stringify({ errors: [], a: 'b' })
  ])
})

test('write | errors are preserved', async (t) => {
  t.context.runlog.debugger.enabled = true
  const error = new Error('b')
  t.context.runlog.error('a', error)
  await t.context.runlog.write()

  const expectedErrors = [
    { stack: error.stack, message: error.message }
  ]
  t.deepEqual(t.context.tempWriter.write.lastCall.args, [
    JSON.stringify({ errors: expectedErrors })
  ])
})
