import { ethers } from "ethers";
import config from "./config.json";
import { setUserWalletAction } from "./redux/actions/contract.actions";
import { store } from "./redux/store";

const ethereum = window.ethereum;
let currentNetwork;
let wallet;

async function switchNetwork() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${config.mainChainId.toString(16)}` }],
        });
    } catch (err) {
        console.error(err);
    }
}

export default {
    connect: async () => {
        try {
            if (ethereum) {
                currentNetwork = ethereum.networkVersion;
                if (currentNetwork !== config.mainChainId) {
                    await switchNetwork();
                }
                // connecting to Metamask
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });
		wallet = accounts[0];
                console.log("wallet", wallet);
                store.dispatch(setUserWalletAction(accounts[0]));

                return new ethers.providers.Web3Provider(ethereum);
            } else alert("Install Metamask!");
        } catch (err) {
            console.error(err);
        }
    },
};
