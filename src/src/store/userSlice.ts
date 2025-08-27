import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
    id: number;
    name: string;
    faction: string;
    factionData: undefined;
    discordName: string;
    imageUrl: string;
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

export const { setCurrentUser, clearCurrentUser } = userSlice.actions;
export default userSlice.reducer;