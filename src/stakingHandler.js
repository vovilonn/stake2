import { ethers } from "ethers";
import { store } from "./redux/store";
import config from "./config.json";

export async function getStakeDataById(id) {
    const state = store.getState();
    const bigNumberValue = ethers.BigNumber.from(id.toString());
    const contract = state.contract.instance.staking;
    try {
        return await contract.viewUserStakeAny(state.contract.user.wallet, bigNumberValue);
    } catch (err) {
        alert(err);
    }
}

export async function getStakesCount() {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    try {
        const stakesCount = await contract.getCountStake(state.contract.user.wallet);
        return stakesCount.toNumber();
    } catch (err) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
            alert("Need to approve");
        } else {
            if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
                alert("Need to approve");
            } else {
                alert(err);
            }
        }
    }
}

export async function getAllStakesData() {
    const stakes = [];
    try {
        const stakesCount = await getStakesCount();
        for (let i = 0; i < stakesCount; i++) {
            const stakeData = await getStakeDataById(i);
            stakes.push(stakeData);
        }
        console.log(stakes);
        return stakes;
    } catch (err) {
        alert(err);
    }
}

export async function getAvialableRewardById(id) {
    const state = store.getState();
    const bigNumberValue = ethers.BigNumber.from(id.toString());
    const shiftTime = ethers.BigNumber.from(864000);
    const contract = state.contract.instance.staking;
    try {
        return await contract.calcRewardByIndex(config.stakingContractAddress, bigNumberValue, shiftTime);
    } catch (err) {
        alert(err);
    }
}

export async function getAllRewards() {
    const rewards = [];
    try {
        const stakesCount = await getStakesCount();
        for (let i = 0; i < stakesCount; i++) {
            const reward = await getAvialableRewardById(i);
            rewards.push(reward);
        }
        return rewards;
    } catch (err) {
        alert(err);
    }
}

export async function stake(amount) {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    console.log("STAKE wallet", state.contract.user.wallet);
    const bigNumberValue = ethers.BigNumber.from(amount.toString());
    try {
        return await contract.stake(state.contract.user.wallet, bigNumberValue);
    } catch (err) {
        alert(err);
    }
}

export async function claimRewards(id) {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    try {
        return await contract.getReward(config.mainWallet);
    } catch (err) {
        alert(err);
    }
}

export async function unStake(id) {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    console.log("UNSTAKE", state.contract.user.wallet);
    const bigNumberValue = ethers.BigNumber.from(id.toString());
    try {
        const avialableToUnstake = await contract.isPassedTime(state.contract.user.wallet, bigNumberValue);
        if (avialableToUnstake) {
            return await contract.unStake(config.mainWallet);
        } else {
            alert("Unable to unstake!");
        }
    } catch (err) {
        alert(err);
    }
}
