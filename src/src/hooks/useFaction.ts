import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { fetchNui } from "@/utils/fetchNui";
import { setPlayerFactions, selectFaction, Faction } from "@/store/factionSlice";

export const useFaction = () => {
    const dispatch = useAppDispatch();
    const { playerFactions, selectedFaction } = useSelector(
        (state: RootState) => state.faction
    );

    useEffect(() => {
        if (playerFactions.length > 0) return; // Already loaded
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: Faction[] }>("requestPlayerFactions");
                dispatch(setPlayerFactions(data));
            } catch (error) {
                console.error("Error fetching factions:", error);
            }
        };
        fetchData();
    }, [dispatch, playerFactions]);

    return useMemo(() => ({
        playerFactions,
        selectedFaction,
        selectFaction: (id: string) => dispatch(selectFaction(id)),
    }), [playerFactions, selectedFaction, dispatch]);
};