const { promises: { readFile } } = require('fs')
const path = require('path')

const DEFAULT_PKG = { dependencies: {}, devDependencies: {} }

module.exports = {
  read: async () => {
    let packageJson = DEFAULT_PKG
    try {
      const packageJsonFile = await readFile(
        path.join(process.cwd(), 'package.json'),
        'utf8'
      )
      packageJson = JSON.parse(packageJsonFile) || DEFAULT_PKG
    } catch (_) {}
    const deps = []
    for (const pkgName in packageJson.dependencies) {
      deps.push(`${pkgName}@${packageJson.dependencies[pkgName]}`)
    }
    const devDeps = []
    for (const pkgName in packageJson.devDependencies) {
      devDeps.push(`${pkgName}@${packageJson.devDependencies[pkgName]}`)
    }
    return { deps, devDeps }
  }
}
