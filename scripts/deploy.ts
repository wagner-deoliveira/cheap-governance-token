const { ethers } = require("hardhat");
require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  const Pony = await ethers.getContractFactory("Pony");
  const pony = await Pony.deploy(process.env.DEPLOY_WALLET, process.env.MINT_ACCOUNT, process.env.MINTING_ALLOWED_AFTER);

  await pony.deployed();

  console.log("Pony deployed to:", pony.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });