const test = require('ava')
const WindowsAliasController = require('../../src/alias/windows')

test.beforeEach((t) => {
  t.context.alias = new WindowsAliasController({})
})

test('abstract methods require implementation', (t) => {
  t.throws(t.context.alias._convertConfigToAliases, 'override this stub with os-specific logic')
  t.throws(t.context.alias._getAliasFileName, 'override this stub with os-specific logic')
  t.throws(t.context.alias._getSourceCommand, 'override this stub with os-specific logic')
  t.throws(t.context.alias._createAlias, 'override this stub with os-specific logic')
  t.throws(t.context.alias._createRemoveAlias, 'override this stub with os-specific logic')
})
