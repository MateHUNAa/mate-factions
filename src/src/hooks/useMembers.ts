import { useAppDispatch } from "@/store"
import { Member, MockMembers, selectMembers, setMembers } from "@/store/memberSlice"
import { fetchNui } from "@/utils/fetchNui"
import { isEnvBrowser } from "@/utils/misc"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useFaction } from "./useFaction"


export const useMembers = () => {
    const dispatch = useAppDispatch()
    const members = useSelector(selectMembers)

    const { selectedFaction, playerFactions } = useFaction()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) {
                    dispatch(setMembers(MockMembers(39)));
                    return;
                }

                if (!selectedFaction) {
                    return dispatch(setMembers(playerFactions[0].members))
                }

                const { data } = await fetchNui<{ data: Member[] }>('requestFactionMembers', selectedFaction?.id);
                dispatch(setMembers(data));
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchData();
    }, [dispatch, selectedFaction?.id])

    return members
}

export const countMembersInRank = (rankId: number) => {
    const members = useMembers()

    return members.filter(member => member.rank.id == rankId).length
}
