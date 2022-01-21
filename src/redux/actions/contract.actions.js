import { createAction } from "@reduxjs/toolkit";

export const setTokenContractAction = createAction("tokenContract/set");
export const setStakingContractAction = createAction("stakingContract/set");
export const setUserWalletAction = createAction("user/setWallet");
