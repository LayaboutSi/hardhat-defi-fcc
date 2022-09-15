const { ethers } = require("hardhat");

const WETH_TOKEN_ADDRESS = process.env.WETH_TOKEN_ADDRESS || "";

const networkConfig = {
  31337: {
    name: "localhost",
    wethToken: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    lendingPoolAddressesProvider: "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
    daiEthPriceFeed: "0x773616E4d11A78F511299002da57A0a94577F1f4",
    daiToken: "0x6b175474e89094c44da98b954eedeac495271d0f",
    entranceFee: ethers.utils.parseEther("0.01"),
    callbackGasLimit: "500000",
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "0",
    interval: "30",
  },
  // Price Feed Address, values can be obtained at https://docs.chain.link/docs/reference-contracts
  // Default one is ETH/USD contract on Kovan
  42: {
    name: "kovan",
    ethUsdPriceFeed: "0x9326BFA02ADD2366b30bacB125260Af641031331",
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
  },
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    entranceFee: "100000000000000000", // 0.1 ETH
    gasLane: "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "20799",
    callbackGasLimit: "500000",
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];

module.exports = {
  networkConfig,
  developmentChains,
};
