module.exports = async ({ ui, env, profile, config, runlog }, args = []) => {
  ui.stdout.write('Adding Flossbank to supported shell profiles...')
  try {
    const installDir = args[0]

    if (!installDir && !config.getInstallDir()) {
      throw new Error('install dir is required to install')
    }

    if (installDir) {
      await config.setInstallDir(installDir)
    }
    await env.writeEnvFiles()
    await profile.installToProfiles()
  } catch (e) {
    ui.error('\nFlossbank failed to install. Please contact support@flossbank.com for help.')
    runlog.error('failed to install', e)
    return 1
  }
  ui.stdout.write('done!\n')
  return 0
}
