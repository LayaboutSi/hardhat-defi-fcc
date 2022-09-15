const { getNamedAccounts, ethers, network } = require("hardhat");
const { getWeth, AMOUNT } = require("../scripts/getWeth");
const { networkConfig } = require("../helper-hardhat-config");

async function main() {
  await getWeth();
  const { deployer } = await getNamedAccounts();

  // Lending Pool Address Provider: 0xb53c1a33016b2dc2ff3653530bff1848a515c8c5
  const lendingPool = await getLendingPool(deployer);
  console.log(`LendingPool address ${lendingPool.address}`);

  // approve
  const wethTokenAddress = networkConfig[network.config.chainId].wethToken;
  console.log(`WethToken address ${wethTokenAddress}`);

  await approveErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer);
  console.log("Depositing WETH...");
  await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0);
  console.log(`Deposited ${AMOUNT} WETH`);

  let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer);

  const daiPrice = await getDaiPrice();
  const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber());
  const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString());
  console.log(`You can borrow ${amountDaiToBorrow.toString()} DAI`);

  await borrowDai(networkConfig[network.config.chainId].daiToken, lendingPool, amountDaiToBorrowWei, deployer);
  await getBorrowUserData(lendingPool, deployer);
  await repay(amountDaiToBorrowWei, networkConfig[network.config.chainId].daiToken, lendingPool, deployer);
  await getBorrowUserData(lendingPool, deployer);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

async function getLendingPool(account) {
  const lendingPoolAddressProvider = await ethers.getContractAt(
    "ILendingPoolAddressesProvider",
    "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
    account
  );
  const lendingPoolAddress = await lendingPoolAddressProvider.getLendingPool();
  const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account);
  return lendingPool;
}

async function approveErc20(erc20Address, spenderAddress, amount, signer) {
  const erc20Token = await ethers.getContractAt("IERC20", erc20Address, signer);
  const tx = await erc20Token.approve(spenderAddress, amount);
  await tx.wait(1);
  console.log("Approved!");
}

async function getBorrowUserData(lendingPool, account) {
  try {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account);

    console.log(`You have ${totalCollateralETH} worth of ETH Deposited`);
    console.log(`You have ${totalDebtETH} worth of ETH Borrowed`);
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`);
    return { availableBorrowsETH, totalDebtETH };
  } catch (error) {
    console.error(e);
  }
}

async function getDaiPrice() {
  const daiEthPriceFeed = await ethers.getContractAt(
    "AggregatorV3Interface",
    networkConfig[network.config.chainId].daiEthPriceFeed
  );
  const price = (await daiEthPriceFeed.latestRoundData())[1];
  console.log(`The DAI/ETH price is ${price.toString()}`);
  return price;
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrow, account) {
  const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrow, 1, 0, account);
  await borrowTx.wait(1);
  console.log(`You've borrowed ${amountDaiToBorrow} DAI `);
}

async function repay(amount, daiAddress, lendingPool, account) {
  await approveErc20(daiAddress, lendingPool.address, amount, account);
  const repayTx = await lendingPool.repay(daiAddress, amount, 1, account);
  await repayTx.wait(1);
  console.log(`You've repaid ${amount} DAI`);
}
