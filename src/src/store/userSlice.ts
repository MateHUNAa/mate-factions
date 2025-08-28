import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from ".";
import { Rank } from "@/lib/permission";
import { Faction } from "./factionSlice";

export interface MemberData {
    rank: number;
    title?: string | null;
    on_duty: number;
    joined_at: string;
}

export interface User {
    id: number;
    name: string;
    factions: Faction[];
    factionData: undefined;
    discordName: string;
    imageUrl: string;
    identifier: string;
    memberData: MemberData;
    rank: Rank;
}

interface UserState {
    currentUser: User | null;
}

const initialState: UserState = {
    currentUser: null
}


const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setCurrentUser(state, action: PayloadAction<User>) {
            state.currentUser = action.payload
        },
        clearCurrentUser(state) {
            state.currentUser = null
        },
        updateUserRank(state, action: PayloadAction<Rank>) {
            if (!state.currentUser) return

            state.currentUser.rank = action.payload
        }
    }
})

export function useUser() {
    return useSelector((state: RootState) => state.user.currentUser)
}

export const { setCurrentUser, clearCurrentUser,updateUserRank } = userSlice.actions;
export default userSlice.reducer;