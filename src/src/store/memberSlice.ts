import { Rank } from "@/lib/permission";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from ".";
import dayjs from "dayjs";

export interface Member {
    identifier: string;
    rank: Rank;
    joinDate: string;
    lastActive: string;
    status: string;
    avatar: string;
    totalPosts: number;
    name: string;
    faction: string;
}

interface MembersState {
    members: Member[];
}

const initialState: MembersState = {
    members: [],
};



export const MockMembers = (count: number): Member[] => {
    const members: Member[] = []
    const ranks: Rank[] = [
        { name: "Leader", color: "#ff0000", description: "", id: 100, permissions: [] },
        { name: "Captain", color: "#ff8800", description: "", id: 99, permissions: [] },
        { name: "Sergeant", color: "#ffaa00", description: "", id: 2, permissions: [] },
        { name: "Member", color: "#00aa00", description: "", id: 1, permissions: [] },
    ]
    const statuses = ["online", "offline", "busy", "away"]
    const factions = ["Police", "EMS", "Mechanic", "Gang"]

    for (let i = 0; i < count; i++) {
        const rank = ranks[Math.floor(Math.random() * ranks.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const faction = factions[Math.floor(Math.random() * factions.length)]

        members.push({
            identifier: `license:${Math.random().toString(36).substring(2, 10)}`,
            rank: rank,
            joinDate: dayjs(new Date(
                Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 365)
            )).format("MMMM D, YYYY"),
            lastActive: dayjs(new Date(
                Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)
            )).format("MMMM D, YYYY h:mm A"),
            status,
            avatar: `https://cdn.discordapp.com/avatars/575342593630797825/d35c0ebf35bc2499a2a29771b0233f9a?size=1024`, // Random avatar
            totalPosts: Math.floor(Math.random() * 500),
            name: `Member_${i}`,
            faction,
        })
    }

    return members
}

const membersSlice = createSlice({
    name: "members",
    initialState,
    reducers: {
        addMember(state, action: PayloadAction<Member>) {
            state.members.push(action.payload)
        },
        removeMember(state, action: PayloadAction<string>) {
            state.members = state.members.filter((member) => member.identifier !== action.payload)
        },
        updateMember(state, action: PayloadAction<Member>) {
            const index = state.members.findIndex(
                (m) => m.identifier === action.payload.identifier
            );
            if (index !== -1) {
                state.members[index] = action.payload;
            }
        },
        setMembers(state, action: PayloadAction<Member[]>) {
            state.members = action.payload
        }
    }
})

export const selectMembers = (state: RootState) => state.members.members
export const { addMember, removeMember, updateMember, setMembers } =
    membersSlice.actions;

export default membersSlice.reducer;