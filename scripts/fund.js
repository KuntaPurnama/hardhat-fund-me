const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const { deployer } = (await getNamedAccounts()).deployer
    const sendValue = ethers.utils.parseEther("0.1")
    const fundMe = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await fundMe.fund({ value: sendValue })
    await transactionResponse.wait(1)
    console.log("FUNDED!!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
