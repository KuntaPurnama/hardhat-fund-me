const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert, expect } = require("chai")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          const sendValue = ethers.utils.parseEther("0.1")
          beforeEach(async function () {
              //deploy our fundMe contract
              //using hardhat deploy

              //get every (account) in your network in hardhat.config.js
              // const account = await ethers.getSigners()

              deployer = (await getNamedAccounts()).deployer
              // console.log("gere")
              // console.log(deployer)
              //deployment.fixture([tag]) => scan all over deployment script we have and run by the tags
              //not using mixture because we assuming its already deployed
              //   await deployments.fixture(["all"])

              //connect deployer to fund me account
              //ethers.getContract(contract name) => get most recent deployed contract
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allow fund and withdraw", async function () {
              await fundMe.fund({ value: sendValue })
              await fundMe.withdraw()
              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              const deployerBalance = await fundMe.provider.getBalance(deployer)
              console.log(deployerBalance.toString())
              console.log(endingBalance.toString())

              assert.equal(endingBalance.toString(), "0")
          })
      })
