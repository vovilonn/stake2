require("babel-polyfill");

import { ethers } from "ethers";
import metamask from "./metamask";
import tokenABI from "./tokenABI.json";
import stakingABI from "./stakingABI.json";
import config from "./config.json";
import { store } from "./redux/store";
import { setStakingContractAction, setTokenContractAction } from "./redux/actions/contract.actions";
import { getAllStakesData, getAllRewards, stake, unStake, claimRewards } from "./stakingHandler";

const connectBtn = document.querySelector("#connectBtn");
const tokenBalanceEl = document.querySelector("#tokenBalance");
const stakingContainer = document.querySelector("#stakingContainer");
const stakesContainerEl = document.querySelector("#stakes");
const amountToStakeEl = document.querySelector("#amountToStake");
const approveBtn = document.querySelector("#approveBtn");
const metamaskBtn = document.querySelector("#metamaskBtn");
const modal = document.querySelector(".modal");
const closeModalBtn = document.querySelector("#closeModalBtn");
const stakeBtn = document.querySelector("#stakeBtn");
const claimBtn = document.querySelector("#claimBtn");

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
    tokenBalanceEl.textContent = balance.toString();
}

function makeStakeEl({ id, stakeAmount, rewardAmount }) {
    const stakeEl = document.createElement("div");
    stakeEl.innerHTML = ` stake #${id} - ${stakeAmount}WST
                <button id="unstakeBtn" data-stakeid="${id - 1}" class="btn btn-sm btn-outline-primary">unstake</button>
                <p>Reward ${rewardAmount}</p>`;

    return stakeEl;
}

async function setStakeElements() {
    const stakesData = await getAllStakesData();
    const rewards = await getAllRewards();
    console.log("🚀 ~ file: index.js ~ line 53 ~ setStakeElements ~ rewards", rewards);

    stakesData.forEach((data, i) =>
        stakesContainerEl.append(
            makeStakeEl({
                id: i + 1,
                stakeAmount: data._amount.toString(),
                rewardAmount: rewards[i].reward.toString(),
            })
        )
    );

    const unstakeBtns = document.querySelectorAll("#unstakeBtn");

    unstakeBtns.forEach((btn) => {
        btn.addEventListener("click", ({ target }) => {
            unStake(target.dataset.stakeid);
        });
    });
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
        updateTokenBalance();
        setStakeElements();

        toggleModal(false);
        toggleConnect(true);
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

claimBtn.addEventListener("click", async () => {
    await claimRewards();
    console.log("claim");
});

approveBtn.addEventListener("click", async () => {
    const bigNumberValue = ethers.BigNumber.from(amountToStakeEl.value);
    try {
        const { contract } = store.getState();
        await contract.instance.token.approve(config.stakingContractAddress, bigNumberValue);

        console.log("success");
    } catch (err) {
        alert(err);
    }
});
