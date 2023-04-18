const untracerAbi = [
    "function transferToken(address to,uint256 amount) external",
    "function claimRewardAndPrize() external payable returns (bool) ",
    "function claimPrizeAndRestake() external payable returns (bool) ",
    "function getTokenExpiry() external view returns (uint256) ",
    "function stakeToken(uint256 stakeAmount) external payable ",
    "function getStakingContractBalance() public view returns (uint256)",  
    "function withdrawStuckETH() external ",
    "function withdrawStuckERC20Token(IERC20 tokenToRemove) external ",
    "function discoverPrize(address addressToCheck) public view returns (uint256)",     
    "function getTotalPrizeAmount() public view returns (uint256)",
    "function getStakePositionOfAWallet(address walletToCheck) external view returns (uint256)",
    "function getEndPositionOfAWallet(address walletToCheck) external view returns (uint256)"
]

const erc20StandardInterface =  [
    "function approve(address _spender, uint256 _value) public returns (bool success)"
]

// Retrieve all data from the HTML form
const btnConnect = document.getElementById('connect');
const btnConnectWithdraw = document.getElementById('connectWithdrawPanel');
const amountToStake = document.getElementById('amountToStake');
const buttonApprove = document.getElementById('approveButton');
const buttonStake = document.getElementById('lockTokensButton');

/* Information panel */
const totalStakedByPosition = document.getElementById('totalStakedByPosition');
const timeToUnlock = document.getElementById('timeToUnlock');
const totalStakedInContract = document.getElementById('totalStakedInContract');
const ETHPrizeCurrent = document.getElementById('ETHPrizeCurrent');


// Wallet connected to dApp
let userAddress = ""

// Web3 provider
let provider = new ethers.providers.Web3Provider(window.ethereum)

// Address of the smart contract in ETH Chain
const contractAddress = '0xfBC6bE3A4aDd5f47F2d95B73A9dF8ff7D7f0eF2d' // STAKE CONTRACT              
const tokenToStake = '0x9413FbA41C431B80Fb04E4932873e25bda72232E' // TOKEN CONTRACT               

async function getPanelInfo() {
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);

    const myPositionStaked =  await numberContract.getStakePositionOfAWallet(userAddress) / 1000000000000000000;
    const myPositionEndtime =  await numberContract.getEndPositionOfAWallet(userAddress);
    const allStakedInContract =  await numberContract.getStakingContractBalance() / 1000000000000000000;
    const globalPrizeAmount =  await numberContract.getTotalPrizeAmount() / 1000000000000000000;

    /* Convert EPOCH date */
    var endDateConverted = epochToJsDate(myPositionEndtime)    

    /* Show the value on the panel */
    totalStakedByPosition.innerHTML = myPositionStaked
    timeToUnlock.innerHTML = endDateConverted
    totalStakedInContract.innerHTML = allStakedInContract
    ETHPrizeCurrent.innerHTML = globalPrizeAmount
}

function epochToJsDate(ts){
    // ts = epoch timestamp
    // returns date obj
    return new Date(ts*1000);
}

async function approveSpending() {

    // Get the STAKED token from contract
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);

    // Approve spending of the token
    const amountAuthorized = amountToStake.value

    // ETH WEI Conversion of amount
    const amountAuthorizedETH = ethers.utils.parseUnits(amountAuthorized,"ether")

    var tokenContract = new ethers.Contract(tokenToStake, erc20StandardInterface, provider);
    tokenContract.connect(signer).approve(contractAddress, amountAuthorized, {gasLimit: 1000000})
}

/* Execute staking */
async function stake() {
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);
    // ETH WEI Conversion of amount
    const amountAuthorizedETH = ethers.utils.parseUnits(amountToStake.value,"ether")

    // Stake the token approved
    const txResponse = await numberContract.connect(signer).stakeToken(amountAuthorizedETH, {gasLimit: 500000, nonce: undefined,})
    await txResponse.wait()
  }

  /* Get prize and RESTAKE */
  async function prizeAndRestake() {
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);

    // Stake the token approved
    const txResponse = await numberContract.connect(signer).claimPrizeAndRestake({gasLimit: 500000, nonce: undefined,})
    await txResponse.wait()
  }

  /* Get prize and UNSTAKE */
  async function prizeAndUnstake() {
    const signer = provider.getSigner()
    const numberContract = new ethers.Contract(contractAddress, untracerAbi, provider);

    // Stake the token approved
    const txResponse = await numberContract.connect(signer).claimRewardAndPrize({gasLimit: 500000, nonce: undefined,})
    await txResponse.wait()
  }


  
/* Function to connect or disconnect Metamask */
async function connectWallet() {
    // If a connection is active, button will disconnect wallet. If not, execute a connect
    if (userAddress == "")    {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send('eth_requestAccounts', [])
        const signer = provider.getSigner()
        const address = await signer.getAddress(),
        balance = await provider.getBalance(address),
        formattedBalance = ethers.utils.formatEther(balance)
        // Get the first 3 and the last 5 letters and numbers of the wallet connected
        var lastCharacterOfWalletConnected = address.substr(address.length - 5);
        var firstCharacterOfWalletConnected = address.slice(0, 3);
        // Print a message on the button  
        btnConnect.innerHTML ="Connected with " + firstCharacterOfWalletConnected + "..." + lastCharacterOfWalletConnected
        btnConnectWithdraw.innerHTML ="Connected with " + firstCharacterOfWalletConnected + "..." + lastCharacterOfWalletConnected
        // Set the address as a global variable
        userAddress = address     
        /* Show some information on the panel */
        getPanelInfo()
        return signer
    }
    
    else    {
        // Disconnect wallet refreshing page
        connect.innerHTML ="Connect your wallet"
        location.reload();
        return false;
    }
}

/* On windows loading, load this function */
window.addEventListener("load", function(){
})

