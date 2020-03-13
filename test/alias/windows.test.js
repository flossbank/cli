const test = require('ava')
const { PROJECT_NAME } = require('../../src/constants')
const WindowsAliasController = require('../../src/alias/windows')

test.beforeEach((t) => {
  t.context.alias = new WindowsAliasController({})
})

test('_getAliasFileName', (t) => {
  t.is(t.context.alias._getAliasFileName(), 'flossbank_aliases.ps1')
})

test('_getSourceCommand', (t) => {
  t.context.alias.getSourceFilePath = () => 'source-file-path'
  t.is(t.context.alias._getSourceCommand(), '. "source-file-path" > $null 2>&1')
})

test('_createAlias', (t) => {
  t.is(
    t.context.alias._createAlias('npm'),
    `function npm { if (Get-Command ${PROJECT_NAME} -ea Ignore) { ${PROJECT_NAME} npm @args } else {  &(Get-Command -Name npm -Type Application)[0] @args } }`
  )
})

test('_createRemoveAlias', (t) => {
  t.is(t.context.alias._createRemoveAlias('npm'), '')
})
