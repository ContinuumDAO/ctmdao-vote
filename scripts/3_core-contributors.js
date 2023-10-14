const { ethers } = require("hardhat")
const fs = require("fs")

const ctmDAOVoteAddress = "0x1FAaf080a77C421e833CdfCbDeaAa273f0eE23b5"

let core1 = "0x6352a490cfc2c942b823b9ace8164a26c04f0900"  // Apex
let core2 = "0x36d83E7FB7560b78B989Ec309781C10e021354BB"  // Grubby
let core3 = "0xCbC49cbC285fb98239DeBa8a1Eb10Ba7d5bD3023"  // Jerry
let core4 = "0x0942E739716679E4FA55C18413643118F2C7DfcE"  // Selqui

let amount = 2000000  // 2% of CTMDAOVOTE totalSupply

let amountWei = ethers.BigNumber.from(amount).mul("1000000000000000000")
console.log(`amount = ${ethers.utils.formatUnits(amountWei, 'ether')}`)

async function distributeCore() {
    const [admin] = await ethers.getSigners()

    const CTMDAOVOTE = await ethers.getContractFactory("CTMDAOVOTE")
    const ctmDAOVote = await CTMDAOVOTE.attach(ctmDAOVoteAddress)

    let nTry = 0
    let failingIndex = 0
    const FailingIndex = new Error(`Address ${ failingIndex } has failed 10 times.`)

    try {
        const tx = await ctmDAOVote.mint(core1, amountWei)
        await tx.wait(1)
        nTry = 0
        console.log('Core1 mint success')
      } catch(err) {
        nTry++
        i--
    }

    try {
        const tx = await ctmDAOVote.mint(core2, amountWei)
        await tx.wait(1)
        nTry = 0
        console.log('Core2 mint success')
      } catch(err) {
        nTry++
        i--
    }

    try {
        const tx = await ctmDAOVote.mint(core3, amountWei)
        await tx.wait(1)
        nTry = 0
        console.log('Core3 mint success')
      } catch(err) {
        nTry++
        i--
    }

    try {
        const tx = await ctmDAOVote.mint(core4, amountWei)
        await tx.wait(1)
        nTry = 0
        console.log('Core4 mint success')
      } catch(err) {
        nTry++
        i--
    }

    const totalSupplyWei = await ctmDAOVote.totalSupply()
    const totalSupply = ethers.utils.formatUnits(totalSupplyWei, "ether")

    console.log(`\n\n\ntotal supply: ${totalSupply} ContinuumDAOVote`)

}

distributeCore().catch((error) => {
    console.error(error)
    process.exitCode = 1
})