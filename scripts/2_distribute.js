const { ethers } = require("hardhat")
const fs = require("fs")


const recipients = fs.readFileSync("recipients/finalCTMList.json")

const ctmDAOVoteAddress = "0x1FAaf080a77C421e833CdfCbDeaAa273f0eE23b5"


async function distribute() {
    const [admin] = await ethers.getSigners()

    const recipientList = JSON.parse(recipients)

    let totalWei = ethers.BigNumber.from("0")

    const CTMDAOVOTE = await ethers.getContractFactory("CTMDAOVOTE")
    const ctmDAOVote = await CTMDAOVOTE.attach(ctmDAOVoteAddress)

    let nTry = 0
    let failingIndex = 0
    const FailingIndex = new Error(`Address ${ failingIndex } has failed 10 times.`)

    for(let i = 0; i < Object.keys(recipientList).length - 1; i++) {
        const addr = Object.keys(recipientList)[i]
        const balAddr = await ctmDAOVote.balanceOf(addr)
        // if (!balAddr.eq('0')) {
        //   console.log(`${i}: address ${addr} already minted`)
        //   continue
        // }
        if (i!==70 && i!=72) {
          console.log(`${i}: address ${addr} already minted`)
          continue
        }
        const amountWei = recipientList[addr].ctmDaoVoteWei
        const amount = recipientList[addr].ctmDaoVote

        if(nTry >= 9) {
          failingIndex = i
          throw FailingIndex
        }

        const gasBal = ethers.utils.formatUnits(await ethers.provider.getBalance(admin.address), "ether")
        console.log(`Gas balance: ${ gasBal } MATIC\n`)
        console.log(`\n\n${i}: Address ${addr}, minting ${amount}`)

        try {
          const tx = await ctmDAOVote.mint(addr, ethers.BigNumber.from(amountWei))
          await tx.wait(1)
          totalWei = totalWei.add(amountWei)
          nTry = 0
        } catch(err) {
          nTry++
          i--
        }
    }

    const totalSupplyWei = await ctmDAOVote.totalSupply()
    const totalSupply = ethers.utils.formatUnits(totalSupplyWei, "ether")
    const total = ethers.utils.formatUnits(totalWei, "ether")

    console.log(`\n\n\nTotal minted: ${total} ContinuumDAOVote, total supply: ${totalSupply} ContinuumDAOVote`)
}

distribute().catch((error) => {
    console.error(error)
    process.exitCode = 1
})