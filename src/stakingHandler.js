import { ethers } from "ethers";
import { store } from "./redux/store";
import config from "./config.json";

export async function getDailyDistribution() {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    try {
        return await contract.rewardTokensByDay();
    } catch (err) {
        alert(err);
    }
}

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
        console.log("getStakesCount");
        return stakesCount.toNumber();
    } catch (err) {
        if (err.code === "UNPREDICTABLE_GAS_LIMIT") {
            alert("Need to approve");
        } else {
            alert(err);
        }
    }
}

async function getAllStakesData() {
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

export async function getTotalStakedValue() {
    try {
        const stakes = await getAllStakesData();
        let weiTotalStaked = ethers.BigNumber.from(0);

        stakes.forEach((stake) => {
            if (stake._endTime.toNumber() === 0) {
                weiTotalStaked = weiTotalStaked.add(stake._amount.toString());
            }
            console.log("stake", stake);
        });
        return +ethers.utils.formatEther(weiTotalStaked.toString());
    } catch (err) {
        alert(err);
    }
}

export async function getAvialableRewardById(id, shiftTime = 0) {
    const state = store.getState();
    const bigNumberValue = ethers.BigNumber.from(id.toString());
    const contract = state.contract.instance.staking;
    try {
        return await contract.calcRewardByIndex(
            state.contract.user.wallet,
            bigNumberValue,
            ethers.BigNumber.from(shiftTime)
        );
    } catch (err) {
        alert(err);
    }
}

export async function getTotalRewardsValue(shiftTime = 0) {
    let totalRewards = ethers.BigNumber.from(0);
    try {
        const stakesCount = await getStakesCount();
        for (let i = 0; i < stakesCount; i++) {
            const { reward } = await getAvialableRewardById(i, shiftTime);
            console.log(reward);
            totalRewards = totalRewards.add(reward.toString());
        }
        console.log(`TOTAL REWARDS (shiftTime ${shiftTime}): `, totalRewards.toString());
        return totalRewards.toString();
    } catch (err) {
        alert(err);
    }
}

export async function stake(amount) {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    console.log("STAKE wallet", state.contract.user.wallet);
    const bigNumberValue = ethers.utils.parseEther(amount.toString());
    try {
        return await contract.stake(state.contract.user.wallet, bigNumberValue);
    } catch (err) {
        alert(err);
    }
}

export async function claimRewards(id) {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    console.log("CLAIM", state.contract.user.wallet);
    try {
        return await contract.getReward(state.contract.user.wallet);
    } catch (err) {
        alert(err);
    }
}

export async function unStake() {
    const state = store.getState();
    const contract = state.contract.instance.staking;
    console.log("UNSTAKE", state.contract.user.wallet);
    try {
        return await contract.unStake(state.contract.user.wallet);
    } catch (err) {
        console.log(err);
    }
}
