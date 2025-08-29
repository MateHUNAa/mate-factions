import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState, useAppDispatch } from "@/store";
import { fetchNui } from "@/utils/fetchNui";
import { useFaction } from "./useFaction";
import { isEnvBrowser } from "@/utils/misc";
import { NewsItem, setNews } from "@/store/newsSlice";

export const useNews = () => {
    const dispatch = useAppDispatch();
    const news = useSelector((state: RootState) => state.news.news)
    const { selectedFaction, playerFactions } = useFaction();

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) return console.log("TODO: Browser Client ! NoMockNews")
                if (!selectedFaction) return

                const response = await fetchNui<{ data: NewsItem[] }>("requestNews", selectedFaction.id)

                if (!response?.data) {
                    console.warn("No news received from server");
                    return;
                }

                const data = response.data

                const isEqual =
                    data.length === news.length &&
                    data.every((n, i) =>
                        n.title === news[i].title &&
                        n.content === news[i].content &&
                        n.category === news[i].category &&
                        n.priority === news[i].priority &&
                        n.creator === news[i].creator &&
                        new Date(n.createdAt).getTime() === new Date(news[i].createdAt).getTime()
                    )

                if (!isEqual) {
                    console.log(`News updated for ${selectedFaction?.id}`, data)
                    dispatch(setNews(data))
                }

            } catch (err) {
                console.error("ERROR WHILE fetching news:", err)
            }
        }

        fetchData()
    }, [dispatch, selectedFaction?.id])

    return news;
};