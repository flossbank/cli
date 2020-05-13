module.exports = async ({ ui, config, env, profile, runlog }) => {
  ui.stdout.write('Removing Flossbank from supported shell profiles...')
  try {
    await env.deleteEnvFiles()
    await profile.uninstallFromProfiles()
  } catch (e) {
    ui.error('\nFlossbank failed to uninstall. Please contact support@flossbank.com for help.')
    runlog.error('failed to uninstall', e)
    return 1
  }

  ui.stdout.write('done!\n\n')

  ui.stdout.write(`You can safely delete the ${config.getInstallDir()} directory to remove Flossbank.\n`)
  return 0
}
