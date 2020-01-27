const { AbortController } = require('abort-controller')
const { default: nf } = require('node-fetch')
const { TIMEOUT } = require('../constants')

module.exports = async function fetch (url, opts) {
  const controller = new AbortController()
  const timeout = setTimeout(() => {
    controller.abort()
  }, TIMEOUT)
  return nf(url, Object.assign({}, opts, { signal: controller.signal }))
    .finally(() => {
      clearTimeout(timeout)
    })
}
