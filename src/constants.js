module.exports = {
  INTERVAL: 5000,
  AD_URI: 'http://localhost:3000', // TODO replace this with the prod host
  GET_AD: 'getAd',
  COMPLETE: 'complete',
  DEFAULT_CONFIG: {},
  CONFIG_DIR: '.npmc',
  CONFIG_FILENAME: 'config',
  DEFAULT_ADS: [
    {
      body: 'TeacherFund helps public school teachers purchase school supplies to create the best learning environment for teachers',
      url: 'https://theteacherfund.com',
      title: 'The Teacher Fund'
    },
    {
      body: 'Beaker is an experimental browser for exploring and building the peer-to-peer Web.',
      url: 'https://beakerbrowser.com/',
      title: 'Beaker Browser'
    },
    {
      body: 'A protocol for building decentralized applications that work well offline and that no one person can control.',
      url: 'https://ssbc.github.io/scuttlebutt-protocol-guide/',
      title: 'SSB: The protocol of the future.'
    },
    {
      title: 'You are not a product',
      url: 'https://brave.com/',
      body: 'Why use a browser that treats you like one? Enjoy private, secure and fast browsing with Brave.'
    }
  ]
}
