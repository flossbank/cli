module.exports = async ({ alias, ui, runlog }) => {
  const pm = process.argv[3]
  const msg = pm ? `Wrapping ${pm}...` : 'Wrapping supported package managers...'
  process.stdout.write(msg)

  if (pm && !alias.isSupportedPm(pm)) {
    process.stdout.write('skipped!')
    ui.error(`\n${pm} is not a supported package manager.`)
    return
  }
  try {
    if (!pm || pm === 'all') {
      await alias.aliasAllSupportedPackageManagers()
    } else {
      await alias.aliasPackageManager(pm)
    }
  } catch (e) {
    const errorMsg = pm ? `Flossbank failed to wrap ${pm}` : 'Flossbank failed to wrap supported package managers.'
    ui.error(`\n${errorMsg}Please contact support@flossbank.com for help.`)
    runlog.error('failed to wrap', e)
    return
  }
  process.stdout.write('done!\n')
}
