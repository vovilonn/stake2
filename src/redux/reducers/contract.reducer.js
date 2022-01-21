import { createReducer } from "@reduxjs/toolkit";
import {
  setStakingContractAction,
  setTokenContractAction,
  setUserWalletAction,
} from "../actions/contract.actions";

const initialState = {
  instance: {
    token: null,
    staking: null,
  },
  user: {
    wallet: null,
  },
};

export const contractReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(setTokenContractAction, (state, action) => {
      state.instance.token = action.payload;
    })
    .addCase(setStakingContractAction, (state, action) => {
      state.instance.staking = action.payload;
    })
    .addCase(setUserWalletAction, (state, action) => {
      state.user.wallet = action.payload;
    });
});
