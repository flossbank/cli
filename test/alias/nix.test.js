const test = require('ava')
const { PROJECT_NAME } = require('../../src/constants')
const NixAliasController = require('../../src/alias/nix')

test.beforeEach((t) => {
  t.context.alias = new NixAliasController({})
})

test('_getAliasFileName', (t) => {
  t.is(t.context.alias._getAliasFileName(), 'flossbank_aliases.sh')
})

test('_getSourceCommand', (t) => {
  t.context.alias.getSourceFilePath = () => 'source-file-path'
  t.is(t.context.alias._getSourceCommand(), '. "source-file-path"')
})

test('_createAlias', (t) => {
  t.is(
    t.context.alias._createAlias('npm'),
    `unalias npm 2>/dev/null; npm () { command -v ${PROJECT_NAME} >/dev/null 2>&1 && ${PROJECT_NAME} npm $@ || command npm $@; };`
  )
})

test('_createRemoveAlias', (t) => {
  t.is(t.context.alias._createRemoveAlias('npm'), '')
})
