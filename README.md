# ContinuumDAO Vote Token Generation on Polygon

## Description

The vested power of veMULTI held on 14th July 2023 00:00:00 was used to generate a MULTIDAOVOTE token. These balances will be used to create the CTMDAOVOTE token. Any wallet address that voted in the three votes:

1. [Compensation for five frontline workers](https://snapshot.org/#/continuumdao.eth/proposal/0xbb6d62d51b972aab25d18b4864cf8034ebf68bcdcc67950011e4eecf0252624b)
2. [Securing the MULTIDAO multi-sig wallet funds](https://snapshot.org/#/multichaindao.eth/proposal/0xe6de3b869968e43e2d2589b9df628687ef41394603f675cba4b39d31174fec76)
3. [Grant application from ContinuumDAO for MPC network](https://snapshot.org/#/multichaindao.eth/proposal/0x40bfb43bed1ff0a3b35cf09c682414cb1000b7cf9bfd4e3da6f246ab82926344)

were considered for the CTMDAOVOTE token. The mechanism used was to use the balance of MULTIDAOVOTE token for wallets listed at [snapshot.org](https://snapshot.org/#/multichaindao.eth). The list of addresses for each vote are in the files:

1. [Round 1 Voters (CTM)](recipients/round1VotersCTM.json)
2. [Round 1 Voters (MULTI)](recipients/round1VotersMULTI.json) (voting records were considered, however the vote was aborted, because it used the wrong vote token.)
3. [Round 2 Voters](recipients/round2Voters.json)
4. [Round 3 Voters](recipients/round3Voters.json)

We also included seven wallets which held a balance of MULTI on 14th July 2023 00:00:00 from active supporters. Their MULTI balance was multiplied by 0.3 to arrive at the CTMDAOVOTE token equivalent. The [total increment](recipients/extras.json) resulting from this process was not large however.

Further comments can be found in the [list generation code](generateFinalList.js).

Final results are available in [JSON format](recipients/finalCTMList.json), and as a [simple text file](finalCTMVoteListOutput.txt).