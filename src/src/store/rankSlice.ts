import { Permission, Rank } from "@/lib/permission";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";



interface RankState {
    ranks: Rank[];
    permissions: Permission[];
    loaded: boolean;
}

const initialState: RankState = {
    ranks: [],
    permissions: [],
    loaded: false
}

const rankSlice = createSlice({
    name: "ranks",
    initialState,
    reducers: {
        setRanksAndPermissions(state, action: PayloadAction<{ ranks: Rank[], permissions: Permission[] }>) {
            state.ranks = action.payload.ranks;
            state.permissions = action.payload.permissions;
            state.loaded = true
        }
    }
})

export const { setRanksAndPermissions } = rankSlice.actions
export default rankSlice.reducer