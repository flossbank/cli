module.exports = ({ config, runlog }) => {
  if (config.getApiKey() && config.getApiHost()) {
    runlog.debug('check: have api key and api host')
    process.exit(0)
  }
  process.exit(1)
}
