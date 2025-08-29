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
    const { selectedFaction, playerFactions } = useFaction();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) return console.log("TODO: Browser client! NoMockRanks");
                if (!selectedFaction) return dispatch(setRanks(playerFactions[0]?.ranks || []));

                const { data } = await fetchNui<{ data: Rank[] }>("requestFactionRanks", selectedFaction.id);

                // Only update Redux if the array contents actually differ
                const isEqual =
                    data.length === ranks.length &&
                    data.every((r, i) =>
                        r.id === ranks[i].id &&
                        r.name === ranks[i].name &&
                        r.color === ranks[i].color &&
                        r.description === ranks[i].description &&
                        r.permissions.join(",") === ranks[i].permissions.join(",")
                    );

                if (!isEqual) {
                    dispatch(setRanks(data));
                }
            } catch (error) {
                console.error("Error fetching ranks:", error);
            }
        };

        fetchData();
    }, [dispatch, selectedFaction?.id, ranks]);

    return ranks;
};