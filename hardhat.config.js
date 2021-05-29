/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require('dotenv').config()
 require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.5.16",
  networks: {
    cheapeth: {
      url: "https://rpc.cheapeth.org/rpc",
      accounts: [process.env.DEPLOY_PRIVATE_KEY],
      gasPrice: 2000000000
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
  }
};

