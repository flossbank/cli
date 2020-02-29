module.exports = async ({ alias, ui }) => {
  try {
    await alias.unaliasAll()
    await alias.removeFromProfiles()
  } catch (e) {
    ui.error('Flossbank failed to uninstall. Please contact support@flossbank.com for help.')
    return
  }
  ui.info('Flossbank successfully uninstalled from supported package managers.')
}
