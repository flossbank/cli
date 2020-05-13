module.exports = async ({ ui, config, runlog }) => {
  const apiKey = await ui.authenticate()
  if (!apiKey) {
    runlog.record(runlog.keys.AUTH_FLOW_FAILED, true)
    return 1
  }
  config.setApiKey(apiKey)
  runlog.record(runlog.keys.NEW_API_KEY_SET, true)
  return 0
}
