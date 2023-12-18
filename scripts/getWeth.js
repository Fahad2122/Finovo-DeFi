const { ethers } = require('hardhat')
const { WrappedEtherAddress, Amount } = require('../helper-hardhat-config')

async function getWeth() {
    const deployer = await ethers.provider.getSigner()
    
    const iWeth = await ethers.getContractAt("IWeth", WrappedEtherAddress, deployer)

    const tx = await iWeth.deposit({ value: Amount })
    await tx.wait(1)
    const balance = await iWeth.balanceOf(deployer)
    console.log(`Balance: ${balance} weth`)
}

module.exports = {
    getWeth
}