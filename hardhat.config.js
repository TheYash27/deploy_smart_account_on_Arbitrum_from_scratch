require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "arb",
  networks: {
    arb: {
      url: process.env.RPC_URL,
      accounts: ["1eac54aec3a6a38b15766f05866fa3a9f5beb358bff003aa527ef207456279e5", ]
    }
  },
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000
      }
    }
  }
};
