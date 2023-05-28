import "@nomicfoundation/hardhat-toolbox";

module.exports = {
  networks: {
    polygon_mumbai: {
      url: process.env.PROVIDER_URL,
      accounts: [process.env.PRIVATE_KEY as string]
    }
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY as string
  },
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
}
