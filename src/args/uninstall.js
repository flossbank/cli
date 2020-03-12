module.exports = async ({ alias, ui, runlog }) => {
  try {
    await alias.unaliasAllSupportedPackageManagers()
  } catch (e) {
    ui.error('Flossbank failed to uninstall. Please contact support@flossbank.com for help.')
    runlog.error('failed to uninstall', e)
    return
  }
  ui.info('Flossbank successfully uninstalled from supported package managers.')
}
