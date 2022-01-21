import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { contractReducer } from "./reducers/contract.reducer";

const rootReducer = combineReducers({
    contract: contractReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ["tokenContract/set", "stakingContract/set"],
            },
        }),
});