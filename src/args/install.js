module.exports = async ({ alias, ui, profile, runlog }) => {
  ui.info('Installing Flossbank...')
  try {
    await alias.aliasAllSupportedPackageManagers()
    await profile.installToProfiles()
  } catch (e) {
    ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
    runlog.error('failed to install', e)
    return
  }
  ui.info('Flossbank successfully installed for supported package managers.')
  ui.info('\nClose and reopen your terminal to start using Flossbank.')
}
