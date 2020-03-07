const tempWrite = require('temp-write')

module.exports = class TempWriter {
  async write (something) {
    const path = await tempWrite(something)
    return path
  }
}
