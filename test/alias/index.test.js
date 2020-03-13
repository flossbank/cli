const test = require('ava')
const sinon = require('sinon')
const path = require('path')
const os = require('os')
const Alias = require('../../src/alias')

test.beforeEach((t) => {
  t.context.config = {
    getAliases: sinon.stub(),
    getPath: sinon.stub(),
    addAlias: sinon.stub(),
    removeAlias: sinon.stub()
  }
  t.context.profile = {
    addToProfiles: sinon.stub(),
    removeFromProfiles: sinon.stub()
  }
  t.context.alias = new Alias({ config: t.context.config, profile: t.context.profile })
})

test('constructor', (t) => {
  const alias = new Alias({ config: 'config', profile: 'profile' })
  t.is(alias.config, 'config')
  t.is(alias.profile, 'profile')
})

test('aliasAllSupportedPackageManagers', async (t) => {
  t.context.alias._addAlias = sinon.stub()
  t.context.alias._writeSourceFile = sinon.stub()
  t.context.alias._getSourceCommand = sinon.stub().returns('source-command')

  await t.context.alias.aliasAllSupportedPackageManagers()

  t.deepEqual(t.context.profile.addToProfiles.lastCall.args, ['source-command'])
})

test('unaliasAllSupportedPackageManagers', async (t) => {
  t.context.alias._removeAlias = sinon.stub()
  t.context.alias._writeSourceFile = sinon.stub()
  t.context.alias._getSourceCommand = sinon.stub().returns('source-command')

  await t.context.alias.unaliasAllSupportedPackageManagers()

  t.deepEqual(t.context.profile.removeFromProfiles.lastCall.args, ['source-command'])
})

test('list', (t) => {
  t.context.config.getAliases.returns('a list')

  t.is(t.context.alias.list(), 'a list')
})

test('getSourceFilePath', (t) => {
  t.context.config.getPath.returns('aPath')
  t.context.alias._getAliasFileName = sinon.stub().returns('filename')

  t.is(t.context.alias.getSourceFilePath(), path.join('aPath', 'filename'))
})

test('_addAlias', (t) => {
  t.context.alias._createAlias = sinon.stub().returns('new-alias')

  t.context.alias._addAlias('cmd')
  t.deepEqual(t.context.config.addAlias.lastCall.args, ['cmd', 'new-alias'])
})

test('_removeAlias', (t) => {
  t.context.alias._createRemoveAlias = sinon.stub().returns('remove-alias')

  t.context.alias._removeAlias('cmd')
  t.deepEqual(t.context.config.removeAlias.lastCall.args, ['cmd', 'remove-alias'])
})

test('_writeSourceFile | writes', async (t) => {
  t.context.alias.list = sinon.stub()
  t.context.alias.getSourceFilePath = sinon.stub().returns('sourceFilePath')
  t.context.alias._convertConfigToAliases = sinon.stub().returns('aliases')
  t.context.alias._writeFileAsync = sinon.stub()

  await t.context.alias._writeSourceFile()

  t.deepEqual(t.context.alias._writeFileAsync.lastCall.args, [
    'sourceFilePath',
    'aliases'
  ])
})

test('_convertConfigToAliases', (t) => {
  const res = t.context.alias._convertConfigToAliases({ a: 'a-alias', b: 'b-alias' })
  t.is(res, `a-alias${os.EOL}b-alias${os.EOL}`)
})

test('abstract methods require implementation', (t) => {
  t.throws(t.context.alias._getAliasFileName, 'override this stub with os-specific logic')
  t.throws(t.context.alias._getSourceCommand, 'override this stub with os-specific logic')
  t.throws(t.context.alias._createAlias, 'override this stub with os-specific logic')
  t.throws(t.context.alias._createRemoveAlias, 'override this stub with os-specific logic')
})
