const test = require('ava')
const pkgJsonUtil = require('../../src/util/readPackageJson')
const sinon = require('sinon')
const Yarn = require('../../src/pm/yarn')

test.before((t) => {
  t.context.pkgJsonProdDeps = ['yttrium-server@0.0.1']
  t.context.pkgJsonDevDeps = ['standard@0.0.1']
  t.context.pkgJsonDeps = t.context.pkgJsonProdDeps.concat(t.context.pkgJsonDevDeps)

  sinon.stub(pkgJsonUtil, 'read').resolves({
    deps: t.context.pkgJsonProdDeps,
    devDeps: t.context.pkgJsonDevDeps
  })
})

test('yarn | is supported verb', (t) => {
  const supported = [
    'node flossbank',
    'node flossbank install',
    'node flossbank add sodium-native',
    'node flossbank add serve -g',
    'node flossbank add a b c d',
    'node flossbank add a b c d -g'
  ]
  const unsupported = [
    'node flossbank help',
    'node flossbank dev',
    'node flossbank uninstall',
    'node flossbank run install',
    'node flossbank i'
  ]

  for (const args of supported) {
    const yarn = new Yarn(args.split(' '))
    t.true(yarn.isSupportedVerb(), `yarn ${args} should be supported`)
  }
  for (const args of unsupported) {
    const yarn = new Yarn(args.split(' '))
    t.false(yarn.isSupportedVerb(), `yarn ${args} should not be supported`)
  }
})

test('yarn | getTopLevelPackages', async (t) => {
  const tests = [
    { args: 'node flossbank install', pkgs: t.context.pkgJsonDeps },
    { args: 'node flossbank install --prod', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank install --production', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank --prod install', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank --production install', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank add sodium-native', pkgs: t.context.pkgJsonDeps.concat(['sodium-native']) },
    { args: 'node flossbank add sodium-native --production', pkgs: t.context.pkgJsonProdDeps.concat(['sodium-native']) },
    { args: 'node flossbank add sodium-native -g', pkgs: t.context.pkgJsonDeps.concat(['sodium-native']) },
    { args: 'node flossbank add sodium-native --global', pkgs: t.context.pkgJsonDeps.concat(['sodium-native']) },
    { args: 'node flossbank add sodium-native js-deep-equals -g', pkgs: t.context.pkgJsonDeps.concat(['sodium-native', 'js-deep-equals']) },
    { args: 'node flossbank add sodium-native js-deep-equals --global', pkgs: t.context.pkgJsonDeps.concat(['sodium-native', 'js-deep-equals']) }
  ]

  for (const { args, pkgs } of tests) {
    const yarn = new Yarn(args.split(' '))
    t.deepEqual(await yarn.getTopLevelPackages(), pkgs, `${args} => ${pkgs}`)
  }
})
