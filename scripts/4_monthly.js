const { ethers } = require("hardhat")
const fs = require("fs")
const readline = require("node:readline")

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

let file = "month.json"

rl.question("Name of file in recipients/ with distribution info (eg. april.json), defaults to month.json: ", fileName => {
    file = fileName
    rl.close()
    distribute()
})


const distribute = async () => {
    const distributionsJson = fs.readFileSync(`recipients/${file}`)
    const ctmDAOVoteAddress = "0x1FAaf080a77C421e833CdfCbDeaAa273f0eE23b5"
    const [admin] = await ethers.getSigners()

    console.log(`Admin: ${admin.address}`)

    const distributions = JSON.parse(distributionsJson)

    let totalWei = ethers.BigNumber.from("0")

    const CTMDAOVOTE = await ethers.getContractFactory("CTMDAOVOTE")
    const ctmDAOVote = CTMDAOVOTE.attach(ctmDAOVoteAddress)

    let nTry = 0
    let failingIndex = 0
    const FailingIndex = new Error(`Address ${ failingIndex } has failed 3 times.`)

    for(let i = 0; i < distributions.length; i++) {
        const addr = distributions[i].address
        const amount = distributions[i].amount
        const amountWei = ethers.utils.parseUnits(amount, "ether")

        if(nTry >= 2) {
          failingIndex = i
          throw FailingIndex
        }

        const gasBal = ethers.utils.formatUnits(await ethers.provider.getBalance(admin.address), "ether")
        console.log(`Gas balance: ${ gasBal } MATIC\n`)
        console.log(`\n\n${i}: Address ${addr}, minting ${amount}, wei ${amountWei.toString()}`)

        try {
           const tx = await ctmDAOVote.mint(addr, amountWei)
           await tx.wait()
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
