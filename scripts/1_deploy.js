
async function main() {

    const ContinuumDAOVote = await ethers.getContractFactory("CTMDAOVOTE")
    const token = await ContinuumDAOVote.deploy()

    await token.deployed()

    const tokenAddr = token.address

    const name = await token.name()
    const symbol = await token.symbol()
    const decimals = await token.decimals()
    const admin = await token.admin()

    console.log(`${tokenAddr}\n${name}\n${symbol}\n${decimals}\nAdmin address (minting priviliges): ${admin}`)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});