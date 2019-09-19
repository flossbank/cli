const supported = new Set(['yarn', 'npm'])

function main () {
  // this takes the first arg (which should be the package manager)
  // and removes it from the argv (so the actual package manager has
  // a clean argv to parse)
  const pm = process.argv.splice(2, 1).pop()
  
  if (!supported.has(pm)) {
    console.error('Unsupported Package Manager. NPM and Yarn are currently supported.')
    process.exit(1)
  }
  
  require(`./${pm}`)()
  require('./showAd')()
}

main()
