import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import "@nomiclabs/hardhat-etherscan";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",


  gasReporter: {
    enabled: true,
    coinmarketcap: "e1ff3967-4974-44e4-8d9e-cbdaf6cfdeaf",
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    token: "MATIC"
  },

  etherscan: {
    apiKey: {
      polygon: [process.env.api]
    }
  },

  networks: {
    hardhat: {
      chainId: 1337,
    },
    //mumbai: {
    //  url: "https://rpc-mumbai.matic.today",
    //  accounts: [process.env.pk]
    //},
    //matic: {
    //  url: "https://polygon-rpc.com/",
    //  accounts: [process.env.pk]
    //},
  }
}
