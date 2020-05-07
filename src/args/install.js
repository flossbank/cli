module.exports = async ({ ui, profile, runlog }) => {
  ui.info('Installing Flossbank in supported shell profiles...')
  try {
    await profile.installToProfiles()
  } catch (e) {
    ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
    runlog.error('failed to install', e)
    return
  }
  ui.info('Flossbank successfully installed in supported shell profiles.')
  ui.info('\nClose and reopen your terminal to start using Flossbank.')
}
