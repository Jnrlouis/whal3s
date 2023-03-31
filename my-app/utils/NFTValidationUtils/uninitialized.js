
import React from 'react';
import { checkingEngagement } from './claimedNFT';

const Uninitialized = ({utility}) => {

    const unit = () => {
        if (utility?.nfts?.nfts[0]?.engagements.length > 0) {
            checkingEngagement(true);
            console.log(
                "It shouldn't initialize"
            );
            return;
        } else {
            checkingEngagement(false)
        }
    }

    return (
        <div>
            {unit()};
        </div>
    );
};

export default Uninitialized;