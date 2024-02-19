const hre = require('hardhat');

const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const PM_ADDRESS = "0xAD9cC47a27f7c8C3BCCfA85A2B2BC76D9cA6087b";

async function main() {
    const entryPoint = await hre.ethers.getContractAt("EntryPoint", ENTRY_POINT_ADDRESS);

    await entryPoint.depositTo(PM_ADDRESS, {
        value: hre.ethers.parseEther("0.02")
    })

    console.log(`Deposit against entry pt. contract at ${ENTRY_POINT_ADDRESS} was successful!`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });