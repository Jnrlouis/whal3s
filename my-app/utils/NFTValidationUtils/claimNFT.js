import React, {useState} from 'react';
import styles from "../../styles/Home.module.css";

const ClaimNft = ({utility}) => {

    const [loading, setLoading] = useState(false);

    const claim = () => {
        console.log("Claiming NFTs...");
        setLoading(true)
        utility.storeEngagement()
            .catch((e) => {
                console.log("Error storing engagement", e.message);
            })
            .finally(() => {
            setLoading(false)
        })
    }

    return (
        
            <div className={styles.button}>
                {/* <button
                    isLoading={loading}
                    onClick={() => {
                        claim()
                    }}>Claimms</button> */}
                    {claim()}
            </div>
    );
};

export default ClaimNft;