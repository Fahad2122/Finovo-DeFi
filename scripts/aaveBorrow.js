const { ethers } = require("hardhat")
const { getWeth } = require("./getWeth")
const { lendingPoolAddressProvider, WrappedEtherAddress, Amount, daiEthAggregatorV3Address, daiTokenAddress, usdcEthAggregatorV3Address, usdcTokenAddress, linkEthAggregatorV3Address, linkTokenAddress } = require("../helper-hardhat-config")

async function main() {
    await getWeth()
    
    const deployer = await ethers.provider.getSigner()
    const lendingPool = await getLendingPool(deployer)
    const lendingPoolAddress = await lendingPool.getAddress()
    
    await approveERC20(WrappedEtherAddress, Amount, lendingPoolAddress, deployer)

    console.log("Depositing WETH ...")
    await lendingPool.deposit(WrappedEtherAddress, Amount, deployer, 0)
    console.log("Deposited")

    //Working with DAI
    // await borrowDai(lendingPool, deployer)

    //working with USDC
    // await borrowUsdc(lendingPool, deployer)
    
    //working with Link
    await borrowLink(lendingPool, deployer)
}

async function borrowDai(lendingPool, deployer) {
    //borrowing
    let { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)
    
    const amountToBorrowWei = await conversion(availableBorrowsETH, daiEthAggregatorV3Address)

    console.log('Borrowing DAI ...')
    await borrow(daiTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)

    //repay    
    console.log('Repaying Borrowed DAI ...')
    await repay(daiTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)
}

async function borrowUsdc(lendingPool, deployer) {
    //borrowing
    const { totalDebtETH, availableBorrowsETH} = await getBorrowUserData(lendingPool, deployer)

    const amountToBorrowWei = await conversion(availableBorrowsETH, usdcEthAggregatorV3Address)

    console.log('Borrowing USDC ...')
    await borrow(usdcTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)

    //repay
    console.log('Repaying Borrowed USDC ...')
    await repay(usdcTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)
}

async function borrowLink(lendingPool, deployer) {
    const { totalDebtETH, availableBorrowsETH } = await getBorrowUserData(lendingPool, deployer)

    const amountToBorrowWei = await conversion(availableBorrowsETH, linkEthAggregatorV3Address)

    //borrow
    console.log('Borrowing Link ...')
    await borrow(linkTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)

    //repay
    console.log('Repaying Borrowed Link ...')
    await repay(linkTokenAddress, amountToBorrowWei, deployer, lendingPool)
    await getBorrowUserData(lendingPool, deployer)
}

async function repay(tokenAddress, amountToRepayWei, account, lendingPool) {
    await approveERC20(tokenAddress, amountToRepayWei, (await lendingPool.getAddress()), account)
    const tx = await lendingPool.repay(tokenAddress, amountToRepayWei, 2, account)
    await tx.wait(1)
    console.log('you have repayed Token')
}

async function borrow(tokenAddress, amountToBorrowWei, account, lendingPool) {
    const tx = await lendingPool.borrow(tokenAddress, amountToBorrowWei, 2, 0, account)
    await tx.wait(1)
    console.log('you have borrowed Token')
}

async function conversion(availableBorrowsETH, aggregatorV3Address) {
    const price = await getTokenPrice(aggregatorV3Address)
    const amountToBorrow = availableBorrowsETH.toString() * 0.90 * (1/price.toString())
    const amountToBorrowWei = ethers.parseEther(amountToBorrow.toString())
    console.log(`You can borrow ${amountToBorrow.toString()} Token`)

    return amountToBorrowWei
}

async function getTokenPrice(aggregatorV3Address) {
    const tx = await ethers.getContractAt("AggregatorV3Interface", aggregatorV3Address)
    const price = (await tx.latestRoundData())[1]
    console.log(`Token value is per ETH: ${price}`)

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