import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { thunk } from "redux-thunk";
import { favorites_reducer, reco_reducer } from "./playerstore";

const combine = combineReducers({
  favorites: favorites_reducer,
  reco: reco_reducer,
});
const store = configureStore({
  reducer: combine,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
