const Config = require('../src/config')

const INTEG_TEST_KEY = 'cf667c9381f7792bfa772025ff8ee93b89d9a757e6732e87611a0c34b48357d1'

async function main () {
  const config = new Config()
  config.setApiKey(INTEG_TEST_KEY)
}

main()
