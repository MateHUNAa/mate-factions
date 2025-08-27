import { useAppDispatch } from "@/store"
import { Member, MockMembers, selectMembers, setMembers } from "@/store/memberSlice"
import { fetchNui } from "@/utils/fetchNui"
import { isEnvBrowser } from "@/utils/misc"
import { useEffect } from "react"
import { useSelector } from "react-redux"


export const useMembers = () => {
    const dispatch = useAppDispatch()
    const members = useSelector(selectMembers)

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) {
                    dispatch(setMembers(MockMembers(39)));
                    return;
                }

                const { data } = await fetchNui<{ data: Member[] }>('requestFactionMembers');
                dispatch(setMembers(data));
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchData();
    }, [dispatch])

    return members
}