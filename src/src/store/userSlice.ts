import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { RootState } from ".";

export interface MemberData {
    rank: number;
    title?: string | null;
    on_duty: number;
    joined_at: string;
}

export interface User {
    id: number;
    name: string;
    faction: string;
    factionData: undefined;
    discordName: string;
    imageUrl: string;
    identifier: string;
    memberData: MemberData;
    rank: string;
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
            console.log("LocalUser Loaded !")
            state.currentUser = action.payload
        },
        clearCurrentUser(state) {
            state.currentUser = null
        }
    }
})

export function useUser() {
    return useSelector((state: RootState) => state.user.currentUser)
}

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;