const fs = require("fs")
const { ethers } = require("ethers")

// const votersRound1And2 = JSON.parse(fs.readFileSync("receivers/votersRound1And2.json"))
// const votersRound3 = JSON.parse(fs.readFileSync("receivers/votersRound3.json"))
// const extraReceivers = JSON.parse(fs.readFileSync("receivers/extraReceivers.json"))

const round1VotersCTM = JSON.parse(fs.readFileSync("recipients/round1VotersCTM.json"))
const round1VotersMULTI = JSON.parse(fs.readFileSync("recipients/round1VotersMULTI.json"))
const round2Voters = JSON.parse(fs.readFileSync("recipients/round2Voters.json"))
const round3Voters = JSON.parse(fs.readFileSync("recipients/round3Voters.json"))
const extras = JSON.parse(fs.readFileSync("recipients/extras.json"))

const round1Voters = round1VotersCTM.concat(round1VotersMULTI)


const providerString = "https://polygon.llamarpc.com"
const provider = new ethers.providers.JsonRpcProvider(providerString)
const multidaovoteABI = ["function balanceOf(address) view returns (uint256)"]
const multidaovoteAddress = "0x398Aa7DcdbF5F5f336Ff3e7da339a022D00f56d0"
const MultiDAOVote = new ethers.Contract(multidaovoteAddress, multidaovoteABI, provider)


// Generate the total list of voters by concatenating the address lists from previous 3 votes
const allVotersWithDuplicates = round1Voters.concat(round2Voters).concat(round3Voters)
console.log(`Total votes cast: ${ allVotersWithDuplicates.length }`)


// The definitive list of each recipient and the corresponding airdrop amount
const finalList = {}


// Remove duplicates from voter address list
let allVoters = []
for(let i = 0; i < allVotersWithDuplicates.length; i++) {
    const currentAddr = allVotersWithDuplicates[i].toLowerCase()
    if(!allVoters.includes(currentAddr)) {
        allVoters.push(currentAddr)
        finalList[currentAddr] = "0"
    } else continue
}

console.log(`Total voters: ${allVoters.length}`)


// Adding a pause to prevent rate limiting from RPC URL endpoint
const pause = (t) => {
    return new Promise((res, rej) => {
        setTimeout(() => (res("done")), t)
    })
}


const generateFinalList = async () => {

    // Get the MULTIDAOVOTE balance of each address that voted. If the balance is zero, remove it from the recipients list.
    for(let i = 0; i < Object.keys(finalList).length; i++) {
        await pause(200)
        const currentAddr = Object.keys(finalList)[i]
        const multiDAOVoteBal = await MultiDAOVote.balanceOf(currentAddr)

        if(!multiDAOVoteBal.eq("0")) {
            const amount = ethers.utils.formatUnits(multiDAOVoteBal, "ether")
            finalList[currentAddr] = amount
        } else {
            delete finalList[currentAddr]
            i--
            continue
        }

        console.log(`${i}: ${currentAddr}, ${finalList[currentAddr]} CTMDAOVOTE`)
    }

    // Add the MULTI holders who are eligible for the airdrop, due to receive as 30% of their MULTI balance.
    for(let i = 0; i < extras.length; i++) {
        const currentAddr = extras[i].address
        const currentBalance = Number(extras[i].balance)
        const voteBalance = String(currentBalance * 0.3)

        // If they already have a MULTIDAOVOTE balance as well as MULTI on 14th July, add the balances
        if(allVoters.includes(currentAddr)) {
            const veBal = Number(finalList[currentAddr])
            const voteBalSum = String(veBal + Number(voteBalance))
            finalList[currentAddr] = voteBalSum
            console.log(`${allVoters.length + i}: ${currentAddr}: ${currentBalance} MULTI x 0.3 = ${voteBalance}, ${veBal} MULTIDAOVOTE + ${voteBalance} = ${voteBalSum} CTMDAOVOTE`)
        } else {
            finalList[currentAddr] = voteBalance
            console.log(`${allVoters.length + i}: ${currentAddr}: ${currentBalance} MULTI x 0.3 = ${voteBalance} CTMDAOVOTE`)
        }
    }

    let totalVotePower = ethers.BigNumber.from("0")

    for(let i = 0; i < Object.keys(finalList).length; i++) {
        totalVotePower = totalVotePower.add(ethers.utils.parseUnits(finalList[Object.keys(finalList)[i]], "ether"))
    }

    console.log(`\n\nTotal vote power: ${ethers.utils.formatUnits(totalVotePower, "ether")} MULTIDAOVOTE`)

    // Keep a record of the data for use in the airdrop
    fs.writeFileSync("receivers/finalCTMList.json", JSON.stringify(finalList, null, 4))
}

generateFinalList()