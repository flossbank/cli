const color = require('kleur')

const MAX_TITLE_LENGTH = 20
const TITLE_LENGTH_WITH_ELLIPSIS = 23

function truncateTitle (title) {
  if (title.length <= MAX_TITLE_LENGTH) {
    return `${title}${' '.repeat(TITLE_LENGTH_WITH_ELLIPSIS - title.length)}`
  }
  return `${title.slice(0, MAX_TITLE_LENGTH)}...`
}

function uniqueBy (prop) {
  const out = new Set()
  return function (el) {
    if (!el || !el[prop] || out.has(el[prop])) return false
    out.add(el[prop])
    return true
  }
}

module.exports = (ads) => {
  if (!ads || !ads.length) return ''

  const uniqueAds = ads.filter(uniqueBy('id'))

  const adSummary = uniqueAds.reduce((output, ad) => {
    const title = color.white().bold(truncateTitle(ad.title))
    const url = color.blue(ad.url)
    output.push(`${title} | ${url}`)
    return output
  }, [color.white().bold('======== Flossbank Ad Summary ========\n')])

  return adSummary.join('\n')
}
