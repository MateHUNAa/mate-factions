import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import { fetchNui } from "@/utils/fetchNui";
import { isEnvBrowser } from "@/utils/misc";
import { Rank, selectRanks } from "@/lib/permission";
import { MockFactionRanks } from "@/components/members/EditMemberDialog";
import { setRanks } from "@/store/rankSlice";

export const useRanks = () => {
    const dispatch = useAppDispatch();
    const ranks = useSelector(selectRanks);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: Rank[] }>("requestFactionRanks");

                console.log("useRanks: [requestFactionRanks]", data)
                dispatch(setRanks(data));
            } catch (error) {
                console.error("Error fetching ranks:", error);
            }
        };

        fetchData();
    }, [dispatch]);

    return ranks;
};
