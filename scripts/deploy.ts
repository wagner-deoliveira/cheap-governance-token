const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const Lion = await hre.ethers.getContractFactory("Lion");
  const lion = await Lion.deploy("Hello, Hardhat!");

  await lion.deployed();

  console.log("Lion deployed to:", lion.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });