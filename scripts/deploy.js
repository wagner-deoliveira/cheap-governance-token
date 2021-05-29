const { ethers } = require("hardhat");

async function main() {
  // const [deployer] = await ethers.getSigners();

  // console.log(
  //   "Deploying contracts with the account:",
  //   deployer.address
  // );
  // console.log("Account balance:", (await deployer.getBalance()).toString());
  // We get the contract to deploy
  const Lion = await ethers.getContractFactory("Lion");
  const lion = await Lion.deploy(process.env.DEPLOY_WALLET);

  await lion.deployed();

  console.log("Lion deployed to:", lion.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });