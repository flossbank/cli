module.exports = ({ config, runlog }) => {
  if (config.getApiKey() && config.getApiHost()) {
    runlog.debug('check: have api key and api host')
    return 0
  }
  return 1
}
