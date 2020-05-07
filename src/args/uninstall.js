module.exports = async ({ ui, profile, runlog }) => {
  ui.info('Uninstalling Flossbank from supported shell profiles...')
  try {
    await profile.uninstallFromProfiles()
  } catch (e) {
    ui.error('Flossbank failed to uninstall. Please contact support@flossbank.com for help.')
    runlog.error('failed to uninstall', e)
    return
  }
  ui.info('Flossbank successfully uninstalled from supported shell profiles.')
}
