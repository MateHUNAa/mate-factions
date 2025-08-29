import { useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import { Member, selectMembers, setMembers } from "@/store/memberSlice";
import { fetchNui } from "@/utils/fetchNui";
import { useFaction } from "./useFaction";

export const useMembers = () => {
    const dispatch = useAppDispatch();
    const members = useSelector(selectMembers);
    const { selectedFaction, playerFactions } = useFaction();

    useEffect(() => {
        const fetchData = async () => {
            try {
                let newMembers: Member[] = [];

                if (!selectedFaction) {
                    newMembers = playerFactions[0]?.members ?? [];
                } else {
                    const { data } = await fetchNui<{ data: Member[] }>(
                        "requestFactionMembers",
                        selectedFaction.id
                    );
                    newMembers = data;
                }

                if (JSON.stringify(members) !== JSON.stringify(newMembers)) {
                    console.log("Members changed !")
                    dispatch(setMembers(newMembers));
                }
            } catch (error) {
                console.error("Error fetching members:", error);
            }
        };

        fetchData();
    }, [dispatch, selectedFaction?.id, playerFactions]);

    return useMemo(() => members, [members]);
};