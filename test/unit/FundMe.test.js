const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { assert, expect } = require("chai")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
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
              await deployments.fixture(["all"])

              //connect deployer to fund me account
              //ethers.getContract(contract name) => get most recent deployed contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("constructor", async function () {
              it("Set aggregator address in constructor", async function () {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function () {
              it("not enough et", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )

                  // await expect(fundMe.fund()).to.be.reverted
              })

              it("update map getAddressToAmountFunded()", async function () {
                  await fundMe.fund({ value: sendValue })
                  const fundedMoney = await fundMe.getAddressToAmountFunded(
                      deployer
                  )

                  assert.equal(sendValue.toString(), fundedMoney.toString())
              })

              it("getFunder() array", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)

                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })
              it("reset map", async function () {
                  await fundMe.withdraw()
                  const fundedMoney = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal("0", fundedMoney.toString())
              })

              it("reset getFunder()", async function () {
                  await fundMe.withdraw()
                  await expect(fundMe.getFunder(0)).to.be.reverted
              })

              it("withdraw ETH from a single founder", async function () {
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = transactionReceipt.gasUsed.mul(
                      transactionReceipt.effectiveGasPrice
                  )

                  const currentDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const currentFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //gas cost
                  assert.equal(currentFundMeBalance, 0)
                  assert.equal(
                      currentDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString()
                  )
              })

              it("cheaper withdraw ETH from a single founder", async function () {
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  // const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = transactionReceipt.gasUsed.mul(
                      transactionReceipt.effectiveGasPrice
                  )

                  const currentDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const currentFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  //gas cost
                  assert.equal(currentFundMeBalance, 0)
                  assert.equal(
                      currentDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString()
                  )
              })

              it("allow multiple getFunder()", async function () {
                  const accounts = await ethers.getSigners()
                  // console.log(accounts)
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      // console.log(fundMeConnectedContract)
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // const gasCost = transactionReceipt.gasUsed.mul(
                  //     transactionReceipt.effectiveGasPrice
                  // )
                  const currentDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  const currentFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  assert.equal(currentFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance.toString(),
                      sendValue.mul(5).add(sendValue).toString()
                  )
                  assert.equal(
                      currentDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString()
                  )
              })

              it("cheaper allow multiple getFunder()", async function () {
                  const accounts = await ethers.getSigners()
                  // console.log(accounts)
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      // console.log(fundMeConnectedContract)
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // const gasCost = transactionReceipt.gasUsed.mul(
                  //     transactionReceipt.effectiveGasPrice
                  // )
                  const currentDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  const currentFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  for (let i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
                  await expect(fundMe.getFunder(0)).to.be.reverted
                  assert.equal(currentFundMeBalance.toString(), "0")
                  assert.equal(
                      startingFundMeBalance.toString(),
                      sendValue.mul(5).add(sendValue).toString()
                  )
                  assert.equal(
                      currentDeployerBalance.add(gasCost).toString(),
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString()
                  )
              })

              it("only owner allow withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectedContract = await fundMe.connect(
                      accounts[1]
                  )

                  await expect(fundMeConnectedContract.withdraw()).to.be
                      .reverted
              })
          })
      })
