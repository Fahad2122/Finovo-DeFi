const { ethers } = require("hardhat")

const WrappedEtherAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const Amount = ethers.parseEther('0.05')
const lendingPoolAddressProvider = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5"

const daiEthAggregatorV3Address = "0x773616E4d11A78F511299002da57A0a94577F1f4"
const usdcEthAggregatorV3Address = "0x986b5E1e1755e3C2440e960477f25201B0a8bbD4"
const linkEthAggregatorV3Address = "0xDC530D9457755926550b59e8ECcdaE7624181557"

const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
const usdcTokenAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"
const linkTokenAddress = "0x514910771af9ca656af840dff83e8264ecf986ca"

module.exports = {
    WrappedEtherAddress,
    Amount,
    lendingPoolAddressProvider,
    daiEthAggregatorV3Address,
    usdcEthAggregatorV3Address,
    linkEthAggregatorV3Address,
    daiTokenAddress,
    usdcTokenAddress,
    linkTokenAddress,
}