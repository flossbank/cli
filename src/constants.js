module.exports = {
  AD_INTERVAL: 5000,
  DEFAULT_API_HOST: 'https://api.flossbank.com',
  DEFAULT_INSTALL_HOST: 'https://install.flossbank.com',
  SOURCE_VARIANT_SHELL: 'shell',
  SOURCE_VARIANT_POWER: 'power',
  DEFAULT_ALIASES: { shell: {}, power: {} },
  DEFAULT_CONFIG: {},
  PROJECT_NAME: 'flossbank',
  SHEBANG: '#!/usr/bin/env bash',
  USAGE: `
  Usage:
    flossbank [option]
    flossbank <package manager command>

  Options:
    auth <token>    Authenticates with Flossbank API
    wrap [pm]       Wraps specified package manager
    unwrap [pm]     Unwraps specified package manager
    uninstall       Unwraps all package managers and removes shell integration
    help            Shows this help output

  Examples:
    To run \`npm install\` through Flossbank:
      $ flossbank npm install
    To run \`yarn add meow\` through Flossbank:
      $ flossbank yarn add meow
`
}
