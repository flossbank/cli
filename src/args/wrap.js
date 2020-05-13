module.exports = async ({ alias, ui, runlog }) => {
  process.stdout.write('Wrapping supported package managers...')
  try {
    await alias.aliasAllSupportedPackageManagers()
  } catch (e) {
    ui.error('\nFlossbank failed to wrap supported package managers. Please contact support@flossbank.com for help.')
    runlog.error('failed to wrap', e)
    return
  }
  process.stdout.write('done!\n')
}
