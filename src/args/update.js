module.exports = async ({ ui, runlog, update }) => {
  ui.stdout.write('Fetching latest version...')

  let version
  try {
    const { shouldUpdate, latestVersion } = await update.getLatestVersion()
    ui.stdout.write('done!\n')
    if (!shouldUpdate) {
      ui.info(`Flossbank is already up to date! (${latestVersion})`)
      return 0
    }
    version = latestVersion
  } catch (e) {
    ui.stdout.write('failed!\n')
    runlog.error('failed to check for updates', e)
    ui.error('Unable to check for updates. Try manually updating at https://flossbank.com/update')
    return 1
  }

  ui.stdout.write('Update available! Downloading')
  try {
    const stopDots = ui.dots(1000)
    await update.update()
    stopDots()
    ui.stdout.write('done!\n')
    ui.info(`Flossbank successfully updated to ${version}`)
    return 0
  } catch (e) {
    ui.stdout.write('failed!\n')
    runlog.error('failed to update', e)
    ui.error('Unable to update. Try manually updating at https://flossbank.com/update')
    return 1
  }
}
