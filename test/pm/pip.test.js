const test = require('ava')
const Pip = require('../../src/pm/pip')

test('pip | is supported verb', (t) => {
  const supported = [
    'node flossbank install simplejson',
    'node flossbank install simplejson tensorflow',
    'node flossbank download simplejson',
    'node flossbank download simplejson tensorflow',
    'node flossbank install -r requirements.txt',
    'node flossbank install -r morereqs.txt',
    'node flossbank install --requirements requirements.txt'
  ]
  const unsupported = [
    'node flossbank',
    'node flossbank install',
    'node flossbank download',
    'node flossbank install -r',
    'node flossbank install --requirements',
    'node flossbank dev',
    'node flossbank uninstall',
    'node flossbank run install',
    'node flossbank i'
  ]

  for (const args of supported) {
    const pip = new Pip(args.split(' '))
    t.true(pip.isSupportedVerb(), `pip ${args} should be supported`)
  }
  for (const args of unsupported) {
    const pip = new Pip(args.split(' '))
    t.false(pip.isSupportedVerb(), `pip ${args} should not be supported`)
  }
})
