import { BigNumber, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import styles from "../styles/Home.module.css";
import { addLiquidity, calculateCD } from "../utils/addLiquidity";
import {
  getCDTokensBalance,
  getEtherBalance,
  getLPTokensBalance,
  getReserveOfCDTokens,
} from "../utils/getAmounts";
import {
  getTokensAfterRemove,
  removeLiquidity,
} from "../utils/removeLiquidity";
import { swapTokens, getAmountOfTokensReceivedFromSwap } from "../utils/swap";
import { claimed, isEngaged } from "../utils/NFTValidationUtils/claimedNFT";
import dynamic from 'next/dynamic'


const DynWhal3s = dynamic(() => import('../utils/whal3s'), {
  ssr: false
});

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [liquidityTab, setLiquidityTab] = useState(true);
  const zero = BigNumber.from(0);
  const [ethBalance, setEtherBalance] = useState(zero);
  const [reservedCD, setReservedCD] = useState(zero);
  const [etherBalanceContract, setEtherBalanceContract] = useState(zero);
  const [cdBalance, setCDBalance] = useState(zero);
  const [lpBalance, setLPBalance] = useState(zero);
  const [addEther, setAddEther] = useState(zero);
  const [addCDTokens, setAddCDTokens] = useState(zero);
  const [removeEther, setRemoveEther] = useState(zero);
  const [removeCD, setRemoveCD] = useState(zero);
  const [removeLPTokens, setRemoveLPTokens] = useState("0");
  const [swapAmount, setSwapAmount] = useState("");
  const [tokenToBeRecievedAfterSwap, setTokenToBeRecievedAfterSwap] = useState(
    zero
  );
  const [ethSelected, setEthSelected] = useState(true);
  const web3ModalRef = useRef();
  const [walletConnected, setWalletConnected] = useState(false);
  const [step, setStep] = useState(-1);
  const [userEngaged, setUserEngaged] = useState(false);
  let stepp;
  let isEngagedd;

  const getAmounts = async () => {
    try {
      const provider = await getProviderOrSigner(false);
      const signer = await getProviderOrSigner(true);
      const address = await signer.getAddress();
      const _ethBalance = await getEtherBalance(provider, address);
      const _cdBalance = await getCDTokensBalance(provider, address);
      const _lpBalance = await getLPTokensBalance(provider, address);
      const _reservedCD = await getReserveOfCDTokens(provider);
      const _ethBalanceContract = await getEtherBalance(provider, null, true);
      setEtherBalance(_ethBalance);
      setCDBalance(_cdBalance);
      setLPBalance(_lpBalance);
      setReservedCD(_reservedCD);
      setReservedCD(_reservedCD);
      setEtherBalanceContract(_ethBalanceContract);
    } catch (err) {
      console.error(err);
    }
  };

  const _swapTokens = async () => {
    try {
      const swapAmountWei = utils.parseEther(swapAmount);
      if (!swapAmountWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await swapTokens(
          signer,
          swapAmountWei,
          tokenToBeRecievedAfterSwap,
          ethSelected
        );
        setLoading(false);
        await getAmounts();
        setSwapAmount("");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setSwapAmount("");
    }
  };


  const _getAmountOfTokensReceivedFromSwap = async (_swapAmount) => {
    try {
      const _swapAmountWEI = utils.parseEther(_swapAmount.toString());
      if (!_swapAmountWEI.eq(zero)) {
        const provider = await getProviderOrSigner();
        const _ethBalance = await getEtherBalance(provider, null, true);
        const amountOfTokens = await getAmountOfTokensReceivedFromSwap(
          _swapAmountWEI,
          provider,
          ethSelected,
          _ethBalance,
          reservedCD
        );
        setTokenToBeRecievedAfterSwap(amountOfTokens);
      } else {
        setTokenToBeRecievedAfterSwap(zero);
      }
    } catch (err) {
      console.error(err);
    }
  };


  const _addLiquidity = async () => {
    try {
      const addEtherWei = utils.parseEther(addEther.toString());
      if (!addCDTokens.eq(zero) && !addEtherWei.eq(zero)) {
        const signer = await getProviderOrSigner(true);
        setLoading(true);
        await addLiquidity(signer, addCDTokens, addEtherWei);
        setLoading(false);
        setAddCDTokens(zero);
        await getAmounts();
      } else {
        setAddCDTokens(zero);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setAddCDTokens(zero);
    }
  };


  const _removeLiquidity = async () => {
    try {
      const signer = await getProviderOrSigner(true);
      const removeLPTokensWei = utils.parseEther(removeLPTokens);
      setLoading(true);
      await removeLiquidity(signer, removeLPTokensWei);
      setLoading(false);
      await getAmounts();
      setRemoveCD(zero);
      setRemoveEther(zero);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRemoveCD(zero);
      setRemoveEther(zero);
    }
  };


  const _getTokensAfterRemove = async (_removeLPTokens) => {
    try {
      const provider = await getProviderOrSigner();
      const removeLPTokenWei = utils.parseEther(_removeLPTokens);
      const _ethBalance = await getEtherBalance(provider, null, true);
      const cryptoDevTokenReserve = await getReserveOfCDTokens(provider);
      const { _removeEther, _removeCD } = await getTokensAfterRemove(
        provider,
        removeLPTokenWei,
        _ethBalance,
        cryptoDevTokenReserve
      );
      setRemoveEther(_removeEther);
      setRemoveCD(_removeCD);
    } catch (err) {
      console.error(err);
    }
  };

  const getProviderOrSigner = async (needSigner = false) => {
    
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);

    
    const { chainId } = await web3Provider.getNetwork();
    if (chainId !== 5) {
      window.alert("Change the network to goerli");
      throw new Error("Change network to goerli");
    }

    if (needSigner) {
      const signer = web3Provider.getSigner();
      return signer;
    }
    return web3Provider;
  };

  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!web3ModalRef.current) {
      // Assign the Web3Modal class to the reference object by setting its `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "goerli",
        providerOptions: {},
        disableInjectedProvider: false,
      });
      getAmounts();
    }
  }, []);

  useEffect (() => {
    
    setStep(claimed());
    setUserEngaged(isEngaged());

  }, [userEngaged])

  const renderButton = () => {

    if (loading) {
      return <button className={styles.button}>Loading...</button>;
    }
  
    if (userEngaged || (step == 6)) {
      console.log("Broken");
      if (liquidityTab) {
        return (
          <div>
            <div className={styles.description}>
              You have:
              <br />
              {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
              {utils.formatEther(cdBalance)} Crypto Dev Tokens
              <br />
              {utils.formatEther(ethBalance)} Ether
              <br />
              {utils.formatEther(lpBalance)} Crypto Dev LP tokens
            </div>
            <div>
              {utils.parseEther(reservedCD.toString()).eq(zero) ? (
                <div>
                  <input
                    type="number"
                    placeholder="Amount of Ether"
                    onChange={(e) => setAddEther(e.target.value || "0")}
                    className={styles.input}
                  />
                  <input
                    type="number"
                    placeholder="Amount of CryptoDev tokens"
                    onChange={(e) =>
                      setAddCDTokens(
                        BigNumber.from(utils.parseEther(e.target.value || "0"))
                      )
                    }
                    className={styles.input}
                  />
                  <button className={styles.button1} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              ) : (
                <div>
                  <input
                    type="number"
                    placeholder="Amount of Ether"
                    onChange={async (e) => {
                      setAddEther(e.target.value || "0");
                      // calculate the number of CD tokens that
                      // can be added given  `e.target.value` amount of Eth
                      const _addCDTokens = await calculateCD(
                        e.target.value || "0",
                        etherBalanceContract,
                        reservedCD
                      );
                      setAddCDTokens(_addCDTokens);
                    }}
                    className={styles.input}
                  />
                  <div className={styles.inputDiv}>
                    {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                    {`You will need ${utils.formatEther(addCDTokens)} Crypto Dev
                    Tokens`}
                  </div>
                  <button className={styles.button1} onClick={_addLiquidity}>
                    Add
                  </button>
                </div>
              )}
              <div>
                <input
                  type="number"
                  placeholder="Amount of LP Tokens"
                  onChange={async (e) => {
                    setRemoveLPTokens(e.target.value || "0");
                    // Calculate the amount of Ether and CD tokens that the user would recieve
                    // After he removes `e.target.value` amount of `LP` tokens
                    await _getTokensAfterRemove(e.target.value || "0");
                  }}
                  className={styles.input}
                />
                <div className={styles.inputDiv}>
                  {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
                  {`You will get ${utils.formatEther(removeCD)} Crypto
                Dev Tokens and ${utils.formatEther(removeEther)} Eth`}
                </div>
                <button className={styles.button1} onClick={_removeLiquidity}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        );
      } else {
        return (
          <div>
            <input
              type="number"
              placeholder="Amount"
              onChange={async (e) => {
                setSwapAmount(e.target.value || "");
                // Calculate the amount of tokens user would recieve after the swap
                await _getAmountOfTokensReceivedFromSwap(e.target.value || "0");
              }}
              className={styles.input}
              value={swapAmount}
            />
            <select
              className={styles.select}
              name="dropdown"
              id="dropdown"
              onChange={async () => {
                setEthSelected(!ethSelected);
                // Initialize the values back to zero
                await _getAmountOfTokensReceivedFromSwap(0);
                setSwapAmount("");
              }}
            >
              <option value="eth">Ethereum</option>
              <option value="cryptoDevToken">Crypto Dev Token</option>
            </select>
            <br />
            <div className={styles.inputDiv}>
              {/* Convert the BigNumber to string using the formatEther function from ethers.js */}
              {ethSelected
                ? `You will get ${utils.formatEther(
                    tokenToBeRecievedAfterSwap
                  )} Crypto Dev Tokens`
                : `You will get ${utils.formatEther(
                    tokenToBeRecievedAfterSwap
                  )} Eth`}
            </div>
            <button className={styles.button1} onClick={_swapTokens}>
              Swap
            </button>
          </div>
        );
      }
    } else {
      console.log("Not broken");
      // setUserEngaged(isEngaged());
      // setStep(claimed());
      return (
        // <></>
      < DynWhal3s />
      );
    }
  };

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Exchange-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome to Crypto x SAI Exchange!</h1>
          <h3 className={styles.description}>
            Exchange Ethereum &#60;&#62; Crypto Dev Tokens
          </h3>
          <h4 className={styles.description}>
            Only SAI NFT owners are allowed. Why? Because its only for the Elite.
            <br/><br />
            Want to join the club? You can mint SAI NFTs <a href="https://nftcollection-beta.vercel.app/" target="_blank" rel="noreferrer">
              <button2
                className={styles.button}
              >
                here
              </button2>
            </a>
            <br/> <br/>
            Powered by <a href="https://app.whal3s.xyz/" target="_blank" rel="noreferrer">
            <button
                className={styles.button}
              >
                Whal3s
              </button>
            </a>
          </h4>

          {!userEngaged && 
          <div>
            <button
              className={styles.button}
              onClick={() => {
                isEngaged();
                setUserEngaged(isEngaged());
                setStep(claimed());
              }}
              >
              Continue
            </button>
          </div>
          }
          

          {isEngagedd || (stepp == 6) ? 
          <div>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(!liquidityTab);
              }}
            >
            Liquidity
            </button>
            <button
              className={styles.button}
              onClick={() => {
                setLiquidityTab(false);
              }}
            >
              Swap
            </button>
        </div>
          :
          ""}
          
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodev.svg" />
        </div>
      </div>

      <footer className={styles.footer}>
        Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}