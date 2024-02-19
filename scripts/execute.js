// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
const FACTORY_ADDRESS = "0xa303E21C640C29eBb22afC7E1C41fF280Ee41249";
const PM_ADDRESS = "0xAD9cC47a27f7c8C3BCCfA85A2B2BC76D9cA6087b";

async function main() {

  const entryPoint = await hre.ethers.getContractAt("EntryPoint", ENTRY_POINT_ADDRESS);

  const AccountFactory = await hre.ethers.getContractFactory("AccountFactory");
  const [firstSigner] = await hre.ethers.getSigners();
  const firstSignerAddress = await firstSigner.getAddress();
  let initCode = FACTORY_ADDRESS + AccountFactory.interface.encodeFunctionData("createAccount", [firstSignerAddress]).slice(2);

  let sender;
  try {
    await entryPoint.getSenderAddress(initCode);
  } catch (exception) {
    sender = "0x" + exception.data.slice(-40);
  }

  const code = await hre.ethers.provider.getCode(sender);
  if (code !== "0x") {
    initCode = "0x";
  }

  const Account = await hre.ethers.getContractFactory("Account");

  const userOp = {
        sender,
        nonce: "0x" + (await entryPoint.getNonce(sender, 0)).toString(16),
        initCode,
        callData: Account.interface.encodeFunctionData("execute"),
        /*callGasLimit: 370_000,
        verificationGasLimit: 410_000,
        preVerificationGas: 92_500,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),*/
        paymasterAndData: PM_ADDRESS,
        signature: /*firstSigner.signMessage(hre.ethers.getBytes(hre.ethers.id("Account Abstraction by Alchemy University")))*/
        "0xfffffffffffffffffffffffffffffff0000000000000000000000000000000007aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1c"
    }

    const { preVerificationGas, verificationGasLimit, callGasLimit } = await hre.ethers.provider.send("eth_estimateUserOperationGas", [
      userOp,
      ENTRY_POINT_ADDRESS
    ]);

    userOp.preVerificationGas = preVerificationGas;
    userOp.verificationGasLimit = verificationGasLimit;
    userOp.callGasLimit = callGasLimit;

    const { maxFeePerGas } = await hre.ethers.provider.getFeeData();
    userOp.maxFeePerGas = "0x" + maxFeePerGas.toString(16);

    const maxPriorityFeePerGas = await hre.ethers.provider.send("rundler_maxPriorityFeePerGas");
    userOp.maxPriorityFeePerGas = maxPriorityFeePerGas;

    const userOpHash = await entryPoint.getUserOpHash(userOp);
    userOp.signature = await firstSigner.signMessage(hre.ethers.getBytes(userOpHash));

    const opHash = await hre.ethers.provider.send("eth_sendUserOperation", [
      userOp,
      ENTRY_POINT_ADDRESS
    ])

    setTimeout(async () => {
      const { transactionHash } = await hre.ethers.provider.send("eth_getUserOperationByHash", [opHash]);

      console.log(transactionHash);
    }, 2e4);

    const tx = await entryPoint.handleOps([userOp], firstSignerAddress)
    const receipt = await tx.wait();
    console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
