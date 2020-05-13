module.exports = async ({ ui, config, env, profile, runlog }) => {
  process.stdout.write('Removing Flossbank from supported shell profiles...')
  try {
    await env.deleteEnvFiles()
    await profile.uninstallFromProfiles()
  } catch (e) {
    ui.error('\nFlossbank failed to uninstall. Please contact support@flossbank.com for help.')
    runlog.error('failed to uninstall', e)
    return 1
  }

  process.stdout.write('done!\n')

  console.log(`\nYou can safely delete the ${config.getInstallDir()} directory to remove Flossbank.`)
  return 0
}
