import { Permission, Rank } from "@/lib/permission";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export type Permissions = Record<string, { label: string, icon: string }>

interface RankState {
    ranks: Rank[];
    permissions: Permissions;
}

const initialState: RankState = {
    ranks: [],
    permissions: {},
};

const rankSlice = createSlice({
    name: "ranks",
    initialState,
    reducers: {
        // --- Ranks ---
        setRanks(state, action: PayloadAction<Rank[]>) {
            state.ranks = action.payload;
        },
        addRank(state, action: PayloadAction<Rank>) {
            state.ranks.push(action.payload);
        },
        updateRank(state, action: PayloadAction<{ id: number; data: Partial<Rank> }>) {
            const index = state.ranks.findIndex((r) => r.id === action.payload.id);
            if (index !== -1) {
                state.ranks[index] = { ...state.ranks[index], ...action.payload.data };
            }
        },
        removeRank(state, action: PayloadAction<number>) {
            state.ranks = state.ranks.filter((r) => r.id !== action.payload);
        },

        // --- Permissions ---
        setPermissions(state, action: PayloadAction<Permissions>) {
            state.permissions = action.payload;
        },
    },
});

export const {
    setRanks,
    addRank,
    updateRank,
    removeRank,
    setPermissions,
} = rankSlice.actions;

export default rankSlice.reducer;
