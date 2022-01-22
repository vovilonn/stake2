require("babel-polyfill");

import { ethers } from "ethers";
import metamask from "./metamask";
import tokenABI from "./tokenABI.json";
import stakingABI from "./stakingABI.json";
import config from "./config.json";
import { store } from "./redux/store";
import { setStakingContractAction, setTokenContractAction } from "./redux/actions/contract.actions";
import {
    getTotalRewardsValue,
    stake,
    unStake,
    claimRewards,
    getStakesCount,
    getTotalStakedValue,
    getDailyDistribution,
} from "./stakingHandler";

const connectBtn = document.querySelector("#connectBtn");
const tokenBalanceEl = document.querySelector("#tokenBalance");
const stakingContainer = document.querySelector("#stakingContainer");
const avialableRewardEl = document.querySelector("#avialableReward");
const allRewardsEl = document.querySelector("#allRewards");
const totalStakedEl = document.querySelector("#totalStaked");
const amountToStakeEl = document.querySelector("#amountToStake");
const approveBtn = document.querySelector("#approveBtn");
const metamaskBtn = document.querySelector("#metamaskBtn");
const unstakeBtn = document.querySelector("#unstakeBtn");
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector("#closeModalBtn");
const stakeBtn = document.querySelector("#stakeBtn");
const claimBtn = document.querySelector("#claimBtn");
const dailyDistributionEl = document.querySelector("#dailyDistribution");

function toggleModal(isOpen) {
    modal.style.display = isOpen ? "block" : "none";
}

function toggleConnect(isConnected) {
    isConnected;
    connectBtn.textContent = isConnected ? "connected" : "connect";
    stakingContainer.style.display = isConnected ? "block" : "none";
    connectBtn.disabled = isConnected;
}

async function updateTokenBalance() {
    const { contract } = store.getState();
    const balance = await contract.instance.token.balanceOf(contract.user.wallet);

    tokenBalanceEl.textContent = +ethers.utils.formatEther(balance.toString());
}

// ====== metamask ======

metamaskBtn.addEventListener("click", async () => {
    try {
        const provider = await metamask.connect();
        const signer = provider.getSigner();
        const tokenContractInstance = new ethers.Contract(config.tokenContractAddress, tokenABI, signer);
        const stakingContractInstance = new ethers.Contract(config.stakingContractAddress, stakingABI, signer);
        store.dispatch(setTokenContractAction(tokenContractInstance));
        store.dispatch(setStakingContractAction(stakingContractInstance));
        toggleModal(false);
        toggleConnect(true);

        updateTokenBalance();
        dailyDistributionEl.textContent = await getDailyDistribution();
        totalStakedEl.textContent = await getTotalStakedValue();
        allRewardsEl.textContent = await getTotalRewardsValue(30 * 86400);
        avialableRewardEl.textContent = await getTotalRewardsValue();
    } catch (err) {
        alert(err);
    }
});

// ====== other ======

connectBtn.addEventListener("click", () => {
    toggleModal(true);
});

closeModalBtn.addEventListener("click", () => {
    toggleModal(false);
});

stakeBtn.addEventListener("click", () => {
    console.log("stake value", amountToStakeEl.value);
    stake(amountToStakeEl.value);
});

unstakeBtn.addEventListener("click", async () => {
    await unStake();
    console.log("unstake");
});

claimBtn.addEventListener("click", async () => {
    await claimRewards();
    console.log("claim");
});

approveBtn.addEventListener("click", async () => {
    const bigNumberValue = ethers.utils.parseEther(amountToStakeEl.value);
    try {
        const { contract } = store.getState();
        await contract.instance.token.approve(config.stakingContractAddress, bigNumberValue);

        console.log("success");
    } catch (err) {
        alert(err);
    }
});
