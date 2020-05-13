module.exports = async ({ alias, ui, runlog }) => {
  const pm = process.argv[3]
  const msg = pm ? `Unwrapping ${pm}...` : 'Unwrapping supported package managers...'
  process.stdout.write(msg)
  try {
    if (!pm || pm === 'all') {
      await alias.unaliasAllSupportedPackageManagers()
    } else {
      await alias.unaliasPackageManager(pm)
    }
  } catch (e) {
    const errorMsg = pm ? `Flossbank failed to unwrap ${pm}` : 'Flossbank failed to unwrap supported package managers.'
    ui.error(`\n${errorMsg}Please contact support@flossbank.com for help.`)
    runlog.error('failed to unwrap', e)
    return
  }
  process.stdout.write('done!\n')
}
