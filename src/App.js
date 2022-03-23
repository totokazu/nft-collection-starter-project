import myEpicNFT from './utils/MyEpicNFT.json';
import {ethers} from "ethers";
import React,{useEffect,useState} from "react";
import ReactLoading from 'react-loading';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';


// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'tknkaz';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_MAX = 20;


const CONTRACT_ADDRESS ='0x9B68C8350D61A764C838c23201De523E83831B78'


const App = () => {
  const [mintCount,setMintCount] =useState(0);
  const [currentAccount,setCurrentAccount] = useState("");
  const [minting,setMinting] =useState(false);
  console.log("currentAccont: ",currentAccount);

  const checkIfWalletIsConnected = async () => {
    const {ethereum} = window;
    if(!ethereum){
      console.log("Make sure you have MetaMask!");
      return ;
    } else{
      console.log("We have the ethereum object", ethereum);
    }
    const accounts =await ethereum.request({method: 'eth_accounts'});
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log("Found an authorized account: ",account);
      setCurrentAccount(account);
      setupEventListener()
      setupMintCount();
      checkChainId();
    }else {
      console.log("No authorized account found");
    }
  }

  const connectWallet = async () => {
    try{
      const {ethereum} =window;
      if(!ethereum){
        alert("Get MetaMask!");
        return;
      }
      const accounts =await ethereum.request({method: "eth_requestAccounts"});
      console.log("Connceted",accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener()
      setupMintCount();
      checkChainId();
    }catch (error){
      console.log(error);
    }
  }

  const setupMintCount = async() =>{
    try{
      const {ethereum} =window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectdContract = new ethers.Contract(CONTRACT_ADDRESS,myEpicNFT.abi,signer);
        const number =  await connectdContract.TotalMintCount();
        setMintCount(number.toNumber());
        console.log("setup mint count");
      }else {
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error) {
      console.log(error)
    }
  }

  const setupEventListener= async () =>{
    try{
      const {ethereum} =window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectdContract = new ethers.Contract(CONTRACT_ADDRESS,myEpicNFT.abi,signer);
        connectdContract.on("NewEpicNFTMinted",(from,tokenId) => {
          console.log(from,tokenId.toNumber())
          alert(`あなたのウォレットにNFTを送信しました。OpenSeaに表示されるまで最大で10分かかることがあります。NFTへのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
        });
        console.log("Setup event listener");
      }else {
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error) {
      console.log(error)
    }
  }

  const checkChainId = async () => {
    try{
      const {ethereum} = window;
      if(ethereum){
        let chainId =await ethereum.request({method: 'eth_chainId'});
        console.log("connected to chain" +chainId);
        const rinkebyChainId = "0x4";
        if(chainId !== rinkebyChainId){
          alert("You are not connected to the Rinkeby Test Network");
        }
      }else{
        console.log("Ethereum object doesn't exist!");
      }
    }catch (error){
      console.log(error)
    }
  }

  const askContractToMintNft =async () => {
    const CONTRACT_ADDRESS= "0xF53D72e76589bdbbB193449323D4E03d8702beCF";
    try{
      const{ethereum} =window;
      if(ethereum){
        setMinting(true);
        const provider= new ethers.providers.Web3Provider(ethereum);
        const signer =provider.getSigner();
        const connectedContract =new ethers.Contract(CONTRACT_ADDRESS,myEpicNFT.abi,signer);
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        console.log("mining.. please wait");
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
        setMinting(false);
      }else {
        console.log("ethereum object does not exist!");
      }
    }catch (error){
      console.log(error);
    }
  }
  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  },[])

  const Normal = () =>{
    <p className="header gradient-text">これまでに発行されたNFTの数{mintCount}/{TOTAL_MINT_MAX}</p>
  };

  const Loading = () => {
    <div> 
      <p className="sub-text">現在、minting中です。しばらくお待ち下さい。</p>
          <ReactLoading type="bubble" />
    </div>
        
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ): (
            <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          )}
          {minting? (
            <p className="sub-text">現在、minting中です。しばらくお待ち下さい。</p>
          ):(
            <p className="header gradient-text">これまでに発行されたNFTの数{mintCount}/{TOTAL_MINT_MAX}</p>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
          <a 
            className='footer-rari' 
            href="https://rinkeby.rarible.com/collection/0x9b68c8350d61a764c838c23201de523e83831b78/items"
            target="_blank"
            rel="noreferrer"
          >raribleでコレクションを表示</a>
        </div>
      </div>
    </div>
  );
};

export default App;
