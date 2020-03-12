module.exports = async ({ alias, ui, runlog }) => {
  try {
    await alias.aliasAllSupportedPackageManagers()
  } catch (e) {
    ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
    runlog.error('failed to install', e)
    return
  }
  ui.info('Flossbank successfully installed for supported package managers.')
  ui.info('\nClose and reopen your terminal to start using Flossbank or run the following to use it now:')
  ui.info('\t. $(flossbank source)')
}
