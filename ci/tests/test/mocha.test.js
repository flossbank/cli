const assert = require('assert')
const fs = require('fs')

describe('Fake Tests', function () {
  describe('some suite', function () {
    it('Unrun Test', function () {
      // this test throws on purpose
      assert(false)
    })
    it('Tooltip /', function () {
      assert(true)
      fs.writeFileSync('quoted_passthrough_arg_success', '')
    })
  })
})
