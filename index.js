var ver = process.versions.node;
var majorVer = parseInt(ver.split('.')[0], 10);

if (majorVer < 4) {
  console.error('Node version ' + ver + ' is not supported, please use Node.js 4.0 or higher.');
  process.exit(1); // eslint-disable-line no-process-exit
}

function main () {
  var supported = { 'yarn': true, 'npm': true }
  var pm = process.argv.splice(2, 1)
  
  if (!supported[pm]) {
    console.error('Unsupported Package Manager. NPM and Yarn are currently supported.')
    process.exit(1)
  }
  
  require(`./${pm}`)()
  require('./showAd')()
}

main()
