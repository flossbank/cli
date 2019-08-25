const { tmpdir } = require('os')
const { statSync, unlinkSync, writeFileSync } = require('fs')
const { join } = require('path')

const LIMIT_FILE_PATH = join(tmpdir(), 'funding-message-shown')
const LIMIT_TIMEOUT = 60 * 1000 // 1 minute

// Check if the files attributes mark that we showed an ad in this 
// operating system within 60 seconds.
// returns @boolean
function isShownRecently () {
  try {
    const { mtime: lastShown } = statSync(LIMIT_FILE_PATH)
    return Date.now() - lastShown < LIMIT_TIMEOUT
  } catch (e) {}
  return false
}

// Write to empty temp file that ad was shown.
// returns @void 
function markShown () {
  try {
    writeFileSync(LIMIT_FILE_PATH, '')
  } catch (err) {}
}

// Track what the user installed, and all the packages used.
// returns @void
function trackNpmInstall() {
    try {
        // Make network call to write to DB analytics async
    } catch (err) {}
}

// Only used in tests
function clearShown () {
  try {
    unlinkSync(LIMIT_FILE_PATH)
  } catch (err) {}
}

module.exports = {
  isShownRecently,
  markShown,
  clearShown
}