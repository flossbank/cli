module.exports = {
  AD_INTERVAL: 5000,
  DEFAULT_API_HOST: 'https://api.flossbank.com',
  SOURCE_VARIANT_SHELL: 'shell',
  SOURCE_VARIANT_POWER: 'power',
  DEFAULT_ALIASES: { shell: {}, power: {} },
  DEFAULT_CONFIG: {},
  PROJECT_NAME: 'flossbank',
  CONFIG_API_KEY: 'apiKey',
  CONFIG_API_HOST: 'apiHost',
  CONFIG_ALIASES: 'aliases',
  CONFIG_LAST_RUNLOG: 'lastRunlog',
  CONFIG_AUTH_OVERRIDES: 'authOverrides',
  CONFIG_INSTALL_DIR: 'installDir',
  SHEBANG: '#!/usr/bin/env bash',
  USAGE: `
  Usage:
    flossbank [option]
    flossbank <package manager command>

  Options:
    auth <token>    Authenticates with Flossbank API
    wrap [pm]       Wraps specified package manager
    unwrap [pm]     Unwraps specified package manager
    help            Shows this help output

  Examples:
    To run \`npm install\` through Flossbank:
      $ flossbank npm install
    To run \`yarn add meow\` through Flossbank:
      $ flossbank yarn add meow
    To authenticate (or re-authenticate) with the Flossbank API:
      $ flossbank --auth
`
}
