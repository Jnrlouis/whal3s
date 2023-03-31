import React, {useState} from 'react';
import styles from "../../styles/Home.module.css";

const ConnectWallet = ({utility}) => {
    const [loading, setLoading] = useState(false);
    const connectWallet = () => {
        console.log("Conecting Wallet...");
        setLoading(true)
        utility.connectWallet()
            .catch((e) => {
                console.log(e.message);
            })
            .finally(() => {
            setLoading(false)
        })
    }
    return (
        <div className={styles.button}>

            <div className="mt-5 flex flex-grow items-end justify-end">
                <button
                    isLoading={loading}
                    className=""
                    onClick={() => {
                        connectWallet()
                    }}>Connect Wallet</button>
            </div>

        </div>
    );
};

export default ConnectWallet;