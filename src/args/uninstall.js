module.exports = async ({ alias, ui, profile, runlog }) => {
  ui.info('Uninstalling Flossbank...')
  try {
    await alias.unaliasAllSupportedPackageManagers()
    await profile.uninstallFromProfiles()
  } catch (e) {
    ui.error('Flossbank failed to uninstall. Please contact support@flossbank.com for help.')
    runlog.error('failed to uninstall', e)
    return
  }
  ui.info('Flossbank successfully uninstalled from supported package managers.')
}
