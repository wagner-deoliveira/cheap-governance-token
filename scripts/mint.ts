const { ethers } = require("hardhat");
require('dotenv').config()

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log(
    "Deploying contracts with the account:",
    deployer.address
  );
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // deploy Pony, sending the total supply to the deployer
  const now = Date.now();
  const wallet = process.env.DEPLOY_WALLET;
  const minter = process.env.MINT_ACCOUNT;


  const Pony = await ethers.getContractFactory("Pony");
  const pony = await Pony.deploy(wallet, minter, now);

  // deploy timelock, controlled by what will be the governor
  const Timelock = await ethers.getContractFactory("Timelock");
  const timelock = await Timelock.deploy(wallet, now)

  // deploy governorAlpha
  const GovernorAlpha = await ethers.getContractFactory("GovernorAlpha");
  const governor = await GovernorAlpha.deploy(wallet, GovernorAlpha, [timelock.address, pony.address])

  await pony.deployed();
  await timelock.deployed();
  await governor.deployed();
  //await Pony['mint(address,uint)'](123);
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