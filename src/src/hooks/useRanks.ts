import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { fetchNui } from "@/utils/fetchNui";
import { Rank } from "@/lib/permission";
import { setRanks } from "@/store/rankSlice";
import { useFaction } from "./useFaction";
import { isEnvBrowser } from "@/utils/misc";

export const useRanks = () => {
    const dispatch = useAppDispatch();
    const ranks = useSelector((state: RootState) => state.ranks.ranks);
    const { selectedFaction, playerFactions } = useFaction()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) return console.log("TODO: Browser client! NoMockRanks")
                if (!selectedFaction) return dispatch(setRanks(playerFactions[0]?.ranks))

                const { data } = await fetchNui<{ data: Rank[] }>("requestFactionRanks", selectedFaction.id);
                dispatch(setRanks(data));
            } catch (error) {
                console.error("Error fetching ranks:", error);
            }
        };

        fetchData();
    }, [dispatch, selectedFaction?.id]);

    return ranks;
};
