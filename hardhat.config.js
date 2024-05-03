// require('dotenv').config()
require("@nomiclabs/hardhat-ethers")
const dotenv = require("dotenv")

dotenv.config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    // localhost: {
    //   url: "http://127.0.0.1:8545"
    // },
    // polygontestnet: {
    //   url: process.env.POLYGON_TESTNET_RPC_PROVIDER,
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    polygon: {
      url: process.env.POLYGON_MAINNET_RPC_PROVIDER,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 137
    },
    // ethereum: {
    //   url: process.env.ETHEREUM_MAINNET_RPC_PROVIDER,
    //   chainId: 1
    // },
    // binance: {
    //   url: process.env.BINANCE_MAINNET_RPC_PROVIDER,
    //   chainId: 56
    // },
    // fantom: {
    //   url: process.env.FANTOM_MAINNET_RPC_PROVIDER,
    //   chainId: 250
    // }
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
}