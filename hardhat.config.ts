import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { network } from "hardhat";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",


  gasReporter: {
    enabled: false,
    coinmarketcap: "e1ff3967-4974-44e4-8d9e-cbdaf6cfdeaf",
    gasPriceApi: "https://api.polygonscan.com/api?module=proxy&action=eth_gasPrice",
    token: "MATIC"
  },

  networks: {
    hardhat: {
      chainId: 1337
    }
  }
}
