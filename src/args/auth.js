module.exports = async ({ ui, config, api }) => {
  const apiKey = await ui.authenticate({
    haveApiKey: !!config.getApiKey(),
    sendAuthEmail: api.sendAuthEmail.bind(api)
  })
  if (!apiKey) return
  config.setApiKey(apiKey)
}
