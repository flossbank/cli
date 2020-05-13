const test = require('ava')
const sinon = require('sinon')
const uninstall = require('../../src/args/uninstall')

test.beforeEach((t) => {
  const config = {
    getInstallDir: sinon.stub()
  }
  const env = {
    deleteEnvFiles: sinon.stub()
  }
  const profile = {
    uninstallFromProfiles: sinon.stub()
  }
  const ui = {
    error: sinon.stub(),
    stdout: { write: sinon.stub() }
  }
  const runlog = {
    error: sinon.stub()
  }
  t.context.deps = { ui, env, profile, config, runlog }
})

test('uninstalls', async (t) => {
  const { deps } = t.context

  t.is(await uninstall(deps), 0)
  t.true(deps.env.deleteEnvFiles.calledOnce)
  t.true(deps.profile.uninstallFromProfiles.calledOnce)
})

test('catches errors', async (t) => {
  const { deps } = t.context

  deps.env.deleteEnvFiles.throws(new Error('the worst'))

  t.is(await uninstall(deps), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
})
