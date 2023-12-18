const { ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const { lendingPoolAddressProvider, WrappedEtherAddress, Amount, daiEthAggregatorV3Address, daiTokenAddress } = require("../helper-hardhat-config")

async function main() {
    await getWeth()
    
    const deployer = await ethers.provider.getSigner()
    const lendingPool = await getLendingPool(deployer)
    const lendingPoolAddress = await lendingPool.getAddress()
    
    await approveERC20(WrappedEtherAddress, Amount, lendingPoolAddress, deployer)

    console.log("Depositing WETH ...")
    await lendingPool.deposit(WrappedEtherAddress, Amount, deployer, 0)
    console.log("Deposited")

    //borrowing
    let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)
    
    const daiPrice = await getDaiPrice()
    const daiAmountToBorrow = availableBorrowsETH.toString() * 0.90 * (1/daiPrice.toString())
    const daiAmountToBorrowWei = ethers.parseEther(daiAmountToBorrow.toString())
    console.log(`You can borrow ${daiAmountToBorrow.toString()} DAI`)

    console.log('Borwwing DAI ...')
    await borrowDai(daiTokenAddress, daiAmountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)

    //repay
    await approveERC20(daiTokenAddress, daiAmountToBorrowWei, lendingPoolAddress, deployer)
    
    console.log('Repaying Borrowed DAI ...')
    await repayDai(daiTokenAddress, daiAmountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)
}

async function repayDai(daiTokenAddress, daiAmountToRepayWei, account, lendingPool) {
    const tx = await lendingPool.repay(daiTokenAddress, daiAmountToRepayWei, 2, account)
    await tx.wait(1)
    console.log('you have repayed DAI')
}

async function borrowDai(daiTokenAddress, daiAmountToBorrowWei, account, lendingPool) {
    const tx = await lendingPool.borrow(daiTokenAddress, daiAmountToBorrowWei, 2, 0, account)
    await tx.wait(1)
    console.log('you have borrowed DAI')
}

async function getDaiPrice() {
    const tx = await ethers.getContractAt("AggregatorV3Interface", daiEthAggregatorV3Address)
    const price = (await tx.latestRoundData())[1]
    console.log(`DAI/ETH value is: ${price}`)

    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } = await lendingPool.getUserAccountData(account)
    console.log(`Total collateral value: ${totalCollateralETH} Eth.`)
    console.log(`Total Borrowed value: ${totalDebtETH} Eth.`)
    console.log(`Availble Borrow Value: ${availableBorrowsETH} Eth.`)

    return {totalDebtETH, availableBorrowsETH}
}

async function approveERC20(erc20Address, amount, spenderAddress, deployer) {
    const iERC20 = await ethers.getContractAt("IERC20", erc20Address, deployer)
    const tx = await iERC20.approve(spenderAddress, amount)
    await tx.wait(1)
    console.log("Approved")
}

async function getLendingPool(deployer) {
    const LendingPoolAddressProvider = await ethers.getContractAt("ILendingPoolAddressesProvider", lendingPoolAddressProvider, deployer)
    const lendingPoolAddress = await LendingPoolAddressProvider.getLendingPool();
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, deployer)
    
    return lendingPool
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.log(error)
        process.exit(1)
})