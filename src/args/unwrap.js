module.exports = async ({ alias, ui, runlog }) => {
  ui.info('Unwrapping supported package managers...')
  try {
    await alias.unaliasAllSupportedPackageManagers()
  } catch (e) {
    ui.error('Flossbank failed to unwrap supported package managers. Please contact support@flossbank.com for help.')
    runlog.error('failed to unwrap', e)
    return
  }
  ui.info('Flossbank successfully unwrapped supported package managers.')
  ui.info('\nClose and reopen your terminal for the changes to take effect.')
}
