import React, {useState} from 'react';
import {NftValidationUtility} from "@whal3s/whal3s.js";
import styles from "../../styles/Home.module.css";
import {format} from "timeago.js"
import { checkingSteps, checkingEngagement, call } from './claimedNFT';

const SelectNft = ({utility}) => {

    const [loading, setLoading] = useState(false);
    const reserve = () => {
        console.log("reserving...", utility.tokenId);
        setLoading(true)
        if (utility?.nfts?.nfts[0]?.engagements.length > 0) {
            checkingEngagement(true);
            return;
        }
        utility.reserveEngagement()
            .catch((e) => {
                console.log("Error reserving engagement", e.message);
            })
            .finally(() => {
            setLoading(false)
        })
    }
    console.log(utility.nfts)
    return (
        <div>

            <div className="h-full flex flex-col">
                {utility?.nfts?.nfts?.length === 0 &&
                    <div
                        className={`relative flex items-start space-x-3 border border-gray-300 bg-white px-6 py-5 shadow-sm hover:border-gray-400 `}>
                        <p>You dont own an NFT. Claim one with the button above.</p>
                    </div>
                }
                {utility?.nfts?.nfts[0]?.engagements.length > 0 ? checkingEngagement(true):
                    <> 
                    {utility?.nfts?.nfts?.length > 0 &&
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
                            {utility?.nfts?.nfts?.map((nft) => (
                                <div
                                    key={nft.attributes?.id?.tokenId}
                                    className={` border border-gray-300 bg-white px-6 py-5 shadow-sm focus-within:ring-2 focus-within:ring-whal3s-500 focus-within:ring-offset-2 hover:border-gray-400 ${utility.tokenId === nft.attributes.id.tokenId ? 'ring-2 ring-whal3s-500 ring-offset-2' : ''}`}>
                                    <div className="relative flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <img
                                                className="h-20 w-20 rounded-lg object-cover bg-cover bg-whal3s-400"
                                                src={nft.attributes.media[0].thumbnail} alt=""/>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div
                                                className={`${nft.valid ? 'cursor-pointer' : 'cursor-not-allowed'}  focus:outline-none`}>
                                                <span onClick={() => {
                                                    if (!nft.valid)
                                                        return
                                                    utility.tokenId = nft.attributes.id.tokenId
                                                }} className="absolute inset-0" aria-hidden="true"/>
                                                <div className="h-full flex flex-col justify-between">
                                                    <div className="flex justify-between">
                                                            <span
                                                                className="text-sm font-medium text-gray-900">{nft.attributes.title}</span>
                                                        {nft.valid ?
                                                            <span
                                                                className="h-min inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"> Valid</span> :
                                                            <span
                                                                className="h-min inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">Invalid</span>
                                                        }
                                                    </div>
                                                    <div className="text-gray-500 hidden sm:block">
                                                        {nft.engagements.length > 0 && nft.engagements.map((engagement) => (
                                                            <p key={engagement.id}>Claimed {format(new Date(engagement.updated_at))} by {engagement.wallet_address.substring(0, 4)}...{engagement.wallet_address.substring(engagement.wallet_address.length - 4)}</p>))}
                                                    </div>
                                                </div>
    
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="mt-2.5 text-gray-500 w-full sm:hidden ">
                                        {nft.engagements.length > 0 && nft.engagements.map((engagement) => (
                                            <p key={engagement.id}>Claimed {format(new Date(engagement.updated_at))} by {engagement.wallet_address.substring(0, 4)}...{engagement.wallet_address.substring(engagement.wallet_address.length - 4)}</p>))}
                                    </div> */}
    
    
                                </div>
                            ))}
                        </div>
                    }
                    </>
                }
                {
                    !utility?.nfts?.nfts[0]?.engagements.length > 0 &&
                    <div className={styles.button}>

                    <button
                        // disabled={utility.step !== NftValidationUtility.STEP_TOKEN_SELECTED}
                        isLoading={loading}
                        onClick={() => {
                            if (utility.step !== NftValidationUtility.STEP_TOKEN_SELECTED)
                                console.log("Utility Step is: ", utility.step);
                                console.log("Token Selected Step is: ", NftValidationUtility.STEP_TOKEN_SELECTED);
                                try {
                                    utility.tokenId = utility.nfts.nfts[0].attributes.id.tokenId;
                                } catch (error) {
                                    return;
                                }
                            reserve()
                        }}
                    >Proceed</button>
                </div>
                }

            </div>
        </div>

    );
};

export default SelectNft;