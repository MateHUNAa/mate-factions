import { Rank } from "@/lib/permission";
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { MemberData } from "./userSlice";
import { Member, setMembers } from "./memberSlice";
import { useAppDispatch } from ".";


export interface Faction {
    id: string;
    name: string;
    label: string;
    type: string;
    settings?: Record<string, any>;
    ranks: Rank[];
    memberData: MemberData;
    members: Member[];
    memberCount: number;
    rank: Rank
}

interface FactionState {
    playerFactions: Faction[];
    selectedFaction: Faction | null;
}

const initialState: FactionState = {
    playerFactions: [],
    selectedFaction: null
}

const factionSlice = createSlice({
    name: "factions",
    initialState,
    reducers: {
        setPlayerFactions(state, action: PayloadAction<Faction[]>) {
            state.playerFactions = action.payload || []
            if (state.playerFactions.length > 0 && !state.selectedFaction) {
                state.selectedFaction = state.playerFactions[0]
            }
        },
        selectFaction(state, action: PayloadAction<string>) {
            const faction = state.playerFactions.find((f) => f.id === action.payload)
            if (faction) {
                state.selectedFaction = faction;
            } else {
                console.error("Tried to select a faction, witch is not exists !")
            }
        },
        clearFactions(state, action) {
            state.playerFactions = [];
            state.selectedFaction = null
        }
    }
})

export const { setPlayerFactions, selectFaction, clearFactions } =
    factionSlice.actions;
export default factionSlice.reducer;