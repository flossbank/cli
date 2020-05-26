const debug = require('debug')('flossbank')

const Client = require('./client')
const Config = require('./config')
const Ui = require('./ui')
const Pm = require('./pm')
const Args = require('./args')
const Env = require('./env')
const Alias = require('./alias')
const Profile = require('./profile')
const TempWriter = require('./util/temp')
const UpdateController = require('./update')
const Runlog = require('./util/runlog')

const app = require('./app')

function main () {
  const config = new Config()

  // short circuit for runlogs
  if (process.argv[2] === 'runlog') {
    return console.log(config.getLastRunlog())
  }

  const tempWriter = new TempWriter()
  const runlog = new Runlog({ config, debug, tempWriter })

  const client = new Client({ config, runlog })
  const update = new UpdateController({ tempWriter, config, runlog })

  const pm = new Pm({ runlog })

  const alias = new Alias({ config, pm })
  const env = new Env({ config, alias })
  const profile = new Profile({ env, runlog })

  const ui = new Ui({ config, runlog, client, stdout: process.stdout })
  const args = new Args({ client, update, ui, config, alias, env, profile, runlog })

  app({ config, update, runlog, client, pm, ui, args })
}

main()
