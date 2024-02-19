// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {

  const EP = await hre.ethers.deployContract("EntryPoint");

  await EP.waitForDeployment();
  
  console.log(
    `EP deployed to ${EP.target}`
  );  

  const AF = await hre.ethers.deployContract("AccountFactory");

  await AF.waitForDeployment();

  console.log(
    `AF deployed to ${AF.target}`
  );

  const PM = await hre.ethers.deployContract("PayMaster");
  await PM.waitForDeployment();

  console.log(
    `PM deployed to ${PM.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
