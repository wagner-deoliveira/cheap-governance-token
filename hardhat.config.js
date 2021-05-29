/**
 * @type import('hardhat/config').HardhatUserConfig
 */
 require('dotenv').config()
 
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

