module.exports = async ({ alias, ui, runlog }, args = []) => {
  const pm = args[0]
  const all = pm === 'all'

  const msg = pm && !all ? `Unwrapping ${pm}...` : 'Unwrapping supported package managers...'
  ui.stdout.write(msg)

  try {
    if (!pm || all) {
      await alias.unaliasAllSupportedPackageManagers()
    } else {
      await alias.unaliasPackageManager(pm)
    }
  } catch (e) {
    const errorMsg = pm && !all ? `Flossbank failed to unwrap ${pm}` : 'Flossbank failed to unwrap supported package managers.'
    ui.error(`\n${errorMsg}Please contact support@flossbank.com for help.`)
    runlog.error('failed to unwrap', e)
    return 1
  }
  ui.stdout.write('done!\n')
  return 0
}
