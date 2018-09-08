const HDWalletProvider = require('truffle-hdwallet-provider')
const config = require('./config.json')

// First read in the secrets.json to get our mnemonic
let mnemonic
if (config.mnemonic.length > 0) {
  mnemonic = config.mnemonic
} else {
  console.log('No secrets.json found. If you are trying to publish EPM ' +
    'this will fail. Otherwise, you can ignore this message!')
  mnemonic = ''
}

module.exports = {
  networks: {
    live: {
      network_id: 1 // Ethereum public network
      // optional config values
      // host - defaults to "localhost"
      // port - defaults to 8545
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
    }, rinkeby: {
      provider: function () {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + config.infuraKey, 1)
      },
      network_id: 4
    },
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: '1234'
    }
  }
}
