import { useAppDispatch } from "@/store";
import { setCurrentUser, User } from "@/store/userSlice";
import { fetchNui } from "@/utils/fetchNui";
import { useEffect } from "react";


export function useLoadUser() {
    const dispatch = useAppDispatch()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: User }>("requestLocalUser")
                dispatch(setCurrentUser(data))
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [dispatch])
}