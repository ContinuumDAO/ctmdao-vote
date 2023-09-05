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

const ZERO = ethers.BigNumber.from("0")


// Remove duplicates from voter address list
let allVoters = []
for(let i = 0; i < allVotersWithDuplicates.length; i++) {
    const currentAddr = allVotersWithDuplicates[i].toLowerCase()
    if(!allVoters.includes(currentAddr)) {
        allVoters.push(currentAddr)
        finalList[currentAddr] = {
            amountWei: ZERO,
            amount: "0"
        }
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
            const amountWei = multiDAOVoteBal.toString()
            const amount = ethers.utils.formatUnits(multiDAOVoteBal, "ether")
            finalList[currentAddr] = {
                amountWei,
                amount
            }

        } else {
            delete finalList[currentAddr]
            i--
            continue
        }

        console.log(`${i}: ${currentAddr}, ${finalList[currentAddr].amount} VOTE`)
    }

    // Add the MULTI holders who are eligible for the airdrop, due to receive as 30% of their MULTI balance.
    for(let i = 0; i < extras.length; i++) {
        const currentAddr = extras[i].address
        const currentBalanceWei = ethers.utils.parseUnits(extras[i].balance, "ether")
        const currentBalance = ethers.utils.formatUnits(currentBalanceWei, "ether")
        const voteBalanceWei = currentBalanceWei.mul("3").div("10")
        const voteBalance = ethers.utils.formatUnits(voteBalanceWei, "ether")

        // If they already have a MULTIDAOVOTE balance as well as MULTI on 14th July, add the balances
        if(allVoters.includes(currentAddr)) {
            const veBalWei = finalList[currentAddr].amountWei
            const veBal = finalList[currentAddr].amount
            const voteBalSumWei = voteBalanceWei.add(veBalWei).toString()
            const voteBalSum = ethers.utils.formatUnits(voteBalSumWei, "ether")
            finalList[currentAddr] = {
                amountWei: voteBalSumWei,
                amount: voteBalSum
            }
            console.log(`${allVoters.length + i}: ${currentAddr}: ${currentBalance} MULTI x 0.3 = ${voteBalance}, ${veBal} MULTIDAOVOTE + ${voteBalance} = ${voteBalSum} VOTE`)
        } else {
            finalList[currentAddr] = {
                amountWei: voteBalanceWei.toString(),
                amount: voteBalance
            }
            console.log(`${allVoters.length + i}: ${currentAddr}: ${currentBalance} MULTI x 0.3 = ${voteBalance} VOTE`)
        }
    }

    let totalVotePowerWei = ZERO

    for(let i = 0; i < Object.keys(finalList).length; i++) {
        totalVotePowerWei = totalVotePowerWei.add(finalList[Object.keys(finalList)[i]].amountWei)
    }
   
    console.log(`\n\nTotal vote power: ${ethers.utils.formatUnits(totalVotePowerWei, "ether")} VOTE\n\n`)


    const TEN_MILLION_WEI = ethers.utils.parseUnits("10000000", "ether")

    let totalCtmDaoVoteWei = ZERO

    console.log(`Corrected to amount to 10% of total supply of CTMDAOVOTE`)

    for(let i = 0; i < Object.keys(finalList).length; i++) {
        const currentAddr = Object.keys(finalList)[i]
        const amountWei = ethers.BigNumber.from(finalList[currentAddr].amountWei)

        // Adding 37 wei (0.000000000000000037 tokens) to final recipient to round total up to 10 million
        const ctmDaoVoteWei = (i === Object.keys(finalList).length - 1
            ? amountWei.mul(TEN_MILLION_WEI).div(totalVotePowerWei).add("37")
            : amountWei.mul(TEN_MILLION_WEI).div(totalVotePowerWei)
        )

        const ctmDaoVote = ethers.utils.formatUnits(ctmDaoVoteWei, "ether")
        finalList[currentAddr].ctmDaoVoteWei = ctmDaoVoteWei.toString()
        finalList[currentAddr].ctmDaoVote = ctmDaoVote
        totalCtmDaoVoteWei = totalCtmDaoVoteWei.add(ctmDaoVoteWei)

        console.log(`${i}: ${currentAddr}: ${finalList[currentAddr].amount} x FACTOR = ${ctmDaoVote} CTMDAOVOTE`)
    }

    const totalCtmDaoVote = ethers.utils.formatUnits(totalCtmDaoVoteWei, "ether")

    console.log(`\nTotal CTM DAO Vote: ${totalCtmDaoVote}`)

 
    finalList.totals = {
        totalVotePowerWei: totalVotePowerWei.toString(),
        totalVotePower: ethers.utils.formatUnits(totalVotePowerWei, "ether"),
        totalCtmDaoVoteWei: totalCtmDaoVoteWei.toString(),
        totalCtmDaoVote
    }

    // Keep a record of the data for use in the airdrop
    fs.writeFileSync("recipients/finalCTMList.json", JSON.stringify(finalList, null, 4))
}

generateFinalList()