const test = require('ava')
const sinon = require('sinon')
const install = require('../../src/args/install')

test.beforeEach((t) => {
  const config = {
    getInstallDir: sinon.stub(),
    setInstallDir: sinon.stub()
  }
  const env = {
    writeEnvFiles: sinon.stub()
  }
  const profile = {
    installToProfiles: sinon.stub()
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

test('throws if no install dir and no configured install dir', async (t) => {
  const { deps } = t.context

  deps.config.getInstallDir.returns('')

  t.is(await install(deps, []), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
})

test('sets install dir if provided and installs', async (t) => {
  const { deps } = t.context

  deps.config.getInstallDir.returns('')

  t.is(await install(deps, ['install-dir']), 0)
  t.true(deps.config.setInstallDir.calledWith('install-dir'))
  t.true(deps.env.writeEnvFiles.calledOnce)
  t.true(deps.profile.installToProfiles.calledOnce)
})

test('just installs if already have install dir', async (t) => {
  const { deps } = t.context

  deps.config.getInstallDir.returns('install-dir')

  t.is(await install(deps, []), 0)
  t.true(deps.config.setInstallDir.notCalled)
  t.true(deps.env.writeEnvFiles.calledOnce)
  t.true(deps.profile.installToProfiles.calledOnce)
})

test('catches errors', async (t) => {
  const { deps } = t.context

  deps.config.getInstallDir.throws(new Error('the worst'))

  t.is(await install(deps, []), 1)
  t.true(deps.ui.error.calledOnce)
  t.true(deps.runlog.error.calledOnce)
  t.true(deps.config.setInstallDir.notCalled)
  t.true(deps.env.writeEnvFiles.notCalled)
  t.true(deps.profile.installToProfiles.notCalled)
})
