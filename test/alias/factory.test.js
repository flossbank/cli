const os = require('os')
const test = require('ava')
const sinon = require('sinon')
const AliasFactory = require('../../src/alias/factory')
const WindowsAliasController = require('../../src/alias/windows')
const NixAliasController = require('../../src/alias/nix')

test.before(() => {
  sinon.stub(os, 'platform')
})

test.after.always(() => {
  os.platform.restore()
})

test('constructs windows alias controller if in windows', (t) => {
  os.platform.returns('win32')
  const deps = { config: 'config', profile: 'profile' }
  const alias = AliasFactory.createAliasController(deps)
  t.true(alias instanceof WindowsAliasController)
  t.is(alias.config, 'config')
  t.is(alias.profile, 'profile')
})

test('constructs nix alias controller if in *nix', (t) => {
  os.platform.returns('darwin') // or anything that isn't win32
  const deps = { config: 'config', profile: 'profile' }
  const alias = AliasFactory.createAliasController(deps)
  t.true(alias instanceof NixAliasController)
  t.is(alias.config, 'config')
  t.is(alias.profile, 'profile')
})
