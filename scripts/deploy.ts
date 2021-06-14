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
  const pony = await Pony.deploy(process.env.DEPLOY_WALLET, process.env.MINT_ACCOUNT, Date.now());

  await pony.deployed();
  await Pony['mint(address,uint)'](123);
  //await pony.mint(process.env.DEPLOY_WALLET, 1000000000);

  console.log("Pony deployed to:", pony.address);
  //console.log("Pony minted to:", pony.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });