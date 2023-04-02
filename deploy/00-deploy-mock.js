// function deployFunc() {
//     console.log("hi")
// }

// module.exports.default = deployFunc

// module.exports = async () => {
//     const { getNamedAccounts, deployments } = hre
// }

const {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    //what happen when we want to change chain ?
    //when going for localhost or hardhat network we want to use a mock
    if (developmentChains.includes(network.name)) {
        log("Local network detected! Deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })

        log("Mocks Deployed")
        log("---------------------------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
