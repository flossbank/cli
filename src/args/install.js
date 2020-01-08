module.exports = async ({ alias, ui }) => {
  try {
    await alias.aliasAll()
  } catch (e) {
    ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
    return
  }
  ui.info('Flossbank successfully installed for supported package managers.')
}
