const { ethers, getNamedAccounts } = require("hardhat")

async function main() {
    const deployer = (await getNamedAccounts()).deployer
    const fundMe = await ethers.getContract("FundMe", deployer)
    const transactionResponse = await fundMe.withdraw()
    transactionResponse.wait(1)

    console.log("WITHDRAW SUCCESS!!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
