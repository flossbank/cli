module.exports = async ({ client, ui, config, runlog }, args = []) => {
  ui.stdout.write('Authenticating with Flossbank API...')
  const token = args[0]
  if (!token) {
    runlog.record(runlog.keys.AUTH_FLOW_FAILED, true)
    ui.error('\nNo authentication token found. To authenticate with the Flossbank API, please login at https://flossbank.com and follow the instructions to link this device to your account.')
    return 1
  }
  let apiKey
  try {
    apiKey = await client.getApiKey({ token })
  } catch (e) {
    runlog.error('no API key found for auth token:', e)
  }
  if (!apiKey) {
    ui.error('\nFailed to retrieve API key using provided authentication token. Please try again or email support@flossbank.com for help.')
    runlog.record(runlog.keys.AUTH_FLOW_FAILED, true)
    return 1
  }
  config.setApiKey(apiKey)
  runlog.record(runlog.keys.NEW_API_KEY_SET, true)
  ui.stdout.write('done!\n')
  return 0
}
