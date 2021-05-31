const { ethers } = require("hardhat");
require('dotenv').config()

async function main() {

  const Pony = await ethers.getContractFactory("Pony");
  const pony = await Pony.deploy(process.env.DEPLOY_WALLET, process.env.MINT_ACCOUNT, process.env.MINTING_ALLOWED_AFTER);

  pony.mint(process.env.MINT_ACCOUNT, 1000000000);

  console.log("Pony minted to:", pony.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });