import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import { fetchNui } from "@/utils/fetchNui";
import { RootState } from "@/store";
import { setPlayerFactions, selectFaction, Faction } from "@/store/factionSlice";
import { isEnvBrowser } from "@/utils/misc";
import { useUser } from "@/store/userSlice";


export const useFaction = () => {
    const dispatch = useAppDispatch();
    const { playerFactions, selectedFaction } = useSelector(
        (state: RootState) => state.faction
    );

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) return; // TODO: Mock Factions

                const { data } = await fetchNui<{ data: Faction[] }>(
                    "requestPlayerFactions"
                );

                dispatch(setPlayerFactions(data));
            } catch (error) {
                console.error("Error fetching factions:", error);
            }
        };

        fetchData();
    }, [dispatch]);

    return { playerFactions, selectedFaction, selectFaction: (id: string) => dispatch(selectFaction(id)) };
};


export const getUserRankId = () => {
    const user = useUser()
    const { selectedFaction } = useFaction()

    const rankId = user?.factions.find((f) => f.id == selectedFaction?.id)?.rank?.id

    return rankId || 1
}