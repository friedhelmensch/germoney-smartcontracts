const HDWalletProvider = require("truffle-hdwallet-provider");
const config = require("./config.json");
const web3 = require("web3");
// First read in the secrets.json to get our mnemonic
let mnemonic;
if (config.mnemonic.length > 0) {
  mnemonic = config.mnemonic;
} else {
  console.log(
    "No secrets.json found. If you are trying to publish EPM " +
      "this will fail. Otherwise, you can ignore this message!"
  );
  mnemonic = "";
}

module.exports = {
  networks: {
    live: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://mainnet.infura.io/v3/<--mykey-->",
          0
        );
      },
      network_id: 1,
      gasPrice: web3.utils.toWei("8", "gwei")
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://rinkeby.infura.io/v3/" + config.infuraKey,
          1
        );
      },
      network_id: 4
    },
    ganache: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
      gasPrice: web3.utils.toWei("15", "gwei")
    }
  },
  compilers: {
    solc: {
      version: "0.4.24"
    }
  }
};
