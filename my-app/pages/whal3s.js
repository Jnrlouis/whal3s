import React, {useEffect, useState} from 'react';
import Whal3s, {NftValidationUtility} from '@whal3s/whal3s.js';
import ConnectWallet from "../utils/NFTValidationUtils/connectWallet";
import ClaimNft from '../utils/NFTValidationUtils/claimNFT';
import SelectNft from '../utils/NFTValidationUtils/selectNFT';
import LoadingNfts from '../utils/NFTValidationUtils/loadingNFTs';
import Uninitialized from '../utils/NFTValidationUtils/uninitialized';
import { checkingSteps, checkingEngagement, call } from '../utils/NFTValidationUtils/claimedNFT';

const UtilityComponent = () => {

    const [utility, setUtility] = useState(undefined);
    const [step, setStep] = useState(undefined);
    const [started, setStarted] = useState(false);

    const utilityId = "4e50413d-b4ba-4d52-839e-a939c70c3e80";
  
    const init = async () => {
        console.log('init')
        if(!utilityId) return
        setStep(0)
        if (utility) {
            console.log(utility.nfts.nfts[0]?.engagements.length);
            if (utility?.nfts?.nfts[0]?.engagements.length > 0) {
                checkingEngagement(true);
                setStarted(false);
                return;
            } else checkingEngagement(false);
            // console.log('destroying old utility')
            // utility.destroy()
        } else {
            try {
                setStarted(true);
                const whal3s = new Whal3s();
                const _utility = await whal3s.createValidationUtility(utilityId)
                _utility.addEventListener('stepChanged', (step) => {
                console.log("setting step to ", step.detail.step)
                setStep(step.detail.step);
                setUtility(_utility);
                checkingSteps(step.detail.step);
                step == 6 ? setStarted(false) : "";
            })
            setStep(_utility.step)
            setUtility(_utility)
                
            } catch (error) {
                console.log(error);
                setUtility(undefined);
            }
        }
    }

    useEffect(() => {
        init()
    }, [step])


    return (
       <>   
            {started ?
                <>
                {step === NftValidationUtility.STEP_UNINITIALIZED && <Uninitialized utility={utility}/>}
                {step === NftValidationUtility.STEP_INITIALIZED && <ConnectWallet utility={utility}/>}
                {step === NftValidationUtility.STEP_WALLET_CONNECTED && <LoadingNfts/>}
                {(step === NftValidationUtility.STEP_NFTS_FETCHED || step === NftValidationUtility.STEP_TOKEN_SELECTED) &&
                    <SelectNft utility={utility}/>}
                {step === NftValidationUtility.STEP_RESERVED && <ClaimNft utility={utility}/>}
                {step === NftValidationUtility.STEP_CLAIMED ?  call() : ""}
                </>
            : ""}
       </>
    );
};

export default UtilityComponent;