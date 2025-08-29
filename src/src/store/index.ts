import { configureStore, Action, ThunkAction } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import ranksReducer from "./rankSlice"
import userReducer from "./userSlice"
import membersReducer from "./memberSlice"
import factionReducer from "./factionSlice"
import newsReducer from "./newsSlice"

export const store = configureStore({
  reducer: {
    ranks: ranksReducer,
    user: userReducer,
    members: membersReducer,
    faction: factionReducer,
    news: newsReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
