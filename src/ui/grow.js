const Ui = require('./index.js')

function * getGrowingAd (attr) {
  if (!['title', 'body', 'url'].includes(attr)) {
    throw new Error('invalid attr')
  }
  let width = 64
  while (true) {
    switch (attr) {
      case 'title': {
        yield {
          title: 'A '.repeat(width / 2),
          body: `Title Length Is ${width}`,
          url: 'https://google.com'
        }
        break
      }
      case 'body': {
        yield {
          title: `Body Length Is ${width}`,
          body: 'A '.repeat(width / 2),
          url: 'https://google.com'
        }
        break
      }
      case 'url': {
        yield {
          title: `URL Length Is ${width}`,
          body: 'On the banks of the river Floss {{https://papajohns.com}}',
          url: 'A'.repeat(width)
        }
        break
      }
    }
    width++
  }
}

async function main () {
  const attr = process.argv[2]
  const growingAd = getGrowingAd(attr)
  const config = {
    getUpdateAvailable: () => false
  }
  const client = {
    getAd: () => growingAd.next().value,
    getSeenAds: () => []
  }
  const runlog = {
    debug: () => {}
  }
  const stdout = process.stdout

  const ui = new Ui({ config, client, runlog, stdout })
  ui.interval = 200
  ui.startAds({ pmCmd: 'nothing' })
}

main()
