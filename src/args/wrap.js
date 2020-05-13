module.exports = async ({ alias, ui, runlog }, args = []) => {
  const pm = args[0]
  const all = pm === 'all'

  const msg = pm && !all ? `Wrapping ${pm}...` : 'Wrapping supported package managers...'
  ui.stdout.write(msg)

  if (pm && !all && !alias.isSupportedPm(pm)) {
    ui.stdout.write('skipped!')
    ui.error(`\n${pm} is not a supported package manager.`)
    return 1
  }
  try {
    if (!pm || all) {
      await alias.aliasAllSupportedPackageManagers()
    } else {
      await alias.aliasPackageManager(pm)
    }
  } catch (e) {
    const errorMsg = pm && !all ? `Flossbank failed to wrap ${pm}` : 'Flossbank failed to wrap supported package managers.'
    ui.error(`\n${errorMsg}Please contact support@flossbank.com for help.`)
    runlog.error('failed to wrap', e)
    return 1
  }
  ui.stdout.write('done!\n')
  return 0
}
