module.exports = async ({ alias, ui }) => {
  try {
    await alias.aliasAll()
  } catch (e) {
    ui.error('Flossbank failed to install. Please contact support@flossbank.com for help.')
    return
  }
  ui.info('Flossbank successfully installed for supported package managers.')
  ui.info('\nClose and reopen your terminal to start using Flossbank or run the following to use it now:')
  ui.info('\t. $(flossbank source)')
}
