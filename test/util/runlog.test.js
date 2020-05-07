const test = require('ava')
const sinon = require('sinon')
const debug = require('debug')
const Runlog = require('../../src/util/runlog')

test.before(() => {
  sinon.stub(Date, 'now').returns(1234)
})

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
  t.context.runlog.debugger.enabled = false
})

test.after.always(() => {
  Date.now.restore()
})

test('record | has start and end time', async (t) => {
  t.is(t.context.runlog.records.startTime, 1234)
  t.is(t.context.runlog.records.endTime, undefined)

  t.context.runlog.debugger.enabled = true
  await t.context.runlog.write()
  t.is(t.context.runlog.records.endTime, 1234)
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
    JSON.stringify({ errors: [], startTime: 1234, a: 'b', endTime: 1234 })
  ])
})

test('write | errors are preserved', async (t) => {
  t.context.runlog.debugger.enabled = true
  const error = new Error('b')
  t.context.runlog.error('a', error)
  await t.context.runlog.write()

  const expectedErrors = [
    { message: error.message, stack: error.stack }
  ]
  t.deepEqual(t.context.tempWriter.write.lastCall.args, [
    JSON.stringify({ errors: expectedErrors, startTime: 1234, endTime: 1234 })
  ])
})
