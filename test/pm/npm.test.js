const test = require('ava')
const pkgJsonUtil = require('../../src/util/readPackageJson')
const sinon = require('sinon')
const Npm = require('../../src/pm/npm')

test.before((t) => {
  t.context.pkgJsonProdDeps = ['yttrium-server@0.0.1']
  t.context.pkgJsonDevDeps = ['standard@0.0.1']
  t.context.pkgJsonDeps = t.context.pkgJsonProdDeps.concat(t.context.pkgJsonDevDeps)

  sinon.stub(pkgJsonUtil, 'read').resolves({
    deps: t.context.pkgJsonProdDeps,
    devDeps: t.context.pkgJsonDevDeps
  })
})

test('npm | is supported verb', (t) => {
  const supported = [
    'node flossbank add',
    'node flossbank install',
    'node flossbank i',
    'node flossbank install sodium-native',
    'node flossbank install -g serve',
    'node flossbank i sodium-native',
    'node flossbank i -g serve'
  ]
  const unsupported = [
    'node flossbank',
    'node flossbank t',
    'node flossbank uninstall',
    'node flossbank run install'
  ]

  for (const args of supported) {
    const npm = new Npm(args.split(' '))
    t.true(npm.isSupportedVerb(), `npm ${args} should be supported`)
  }
  for (const args of unsupported) {
    const npm = new Npm(args.split(' '))
    t.false(npm.isSupportedVerb(), `npm ${args} should not be supported`)
  }
})

test('npm | getTopLevelPackages', async (t) => {
  const tests = [
    { args: 'node flossbank add', pkgs: t.context.pkgJsonDeps },
    { args: 'node flossbank install', pkgs: t.context.pkgJsonDeps },
    { args: 'node flossbank install --only=prod', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank --only=prod install', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank i', pkgs: t.context.pkgJsonDeps },
    { args: 'node flossbank i --only=prod', pkgs: t.context.pkgJsonProdDeps },
    { args: 'node flossbank install sodium-native', pkgs: ['sodium-native'] },
    { args: 'node flossbank install sodium-native -g', pkgs: ['sodium-native'] },
    { args: 'node flossbank install sodium-native --global', pkgs: ['sodium-native'] },
    { args: 'node flossbank add sodium-native', pkgs: ['sodium-native'] },
    { args: 'node flossbank add sodium-native -g', pkgs: ['sodium-native'] },
    { args: 'node flossbank add sodium-native --global', pkgs: ['sodium-native'] },
    { args: 'node flossbank install -g serve', pkgs: ['serve'] },
    { args: 'node flossbank install -g serve js-deep-equals', pkgs: ['serve', 'js-deep-equals'] },
    { args: 'node flossbank i sodium-native', pkgs: ['sodium-native'] },
    { args: 'node flossbank i -g serve', pkgs: ['serve'] }
  ]

  for (const { args, pkgs } of tests) {
    const npm = new Npm(args.split(' '))
    t.deepEqual(await npm.getTopLevelPackages(), pkgs, `${args} => ${pkgs}`)
  }
})
