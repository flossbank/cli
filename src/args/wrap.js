module.exports = async ({ alias, ui, runlog }) => {
  ui.info('Wrapping supported package managers...')
  try {
    await alias.aliasAllSupportedPackageManagers()
  } catch (e) {
    ui.error('Flossbank failed to wrap supported package managers. Please contact support@flossbank.com for help.')
    runlog.error('failed to wrap', e)
    return
  }
  ui.info('Flossbank successfully wrapped supported package managers.')
  ui.info('\nClose and reopen your terminal to start using Flossbank.')
}
