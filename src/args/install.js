module.exports = async ({ ui, env, profile, config, runlog }) => {
  process.stdout.write('Adding Flossbank to supported shell profiles...')
  try {
    const installDir = process.argv[3]

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
  process.stdout.write('done!\n')
  return 0
}
