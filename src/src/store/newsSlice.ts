import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type NewsItem = {
    creator: string;
    createdAt: number;
    content: string;
    title: string;
    category: "update" | "event" | "notice" | "guide" | "announcement";
    priority: "high" | "medium" | "low";
}

interface NewsState {
    news: NewsItem[]
}

const initialState: NewsState = {
    news: []
}

const newsSlice = createSlice({
    name: "news",
    initialState,
    reducers: {
        setNews(state, action: PayloadAction<NewsItem[]>) {
            state.news = action.payload
        },
        addNews(state, action: PayloadAction<NewsItem>) {
            state.news.push(action.payload)
        },
        removeNews(state, action: PayloadAction<string>) {
            state.news = state.news.filter((item) => item.title !== action.payload)
        },
        updateNews(state, action: PayloadAction<{ title: string, updated: Partial<NewsItem> }>) {
            const index = state.news.findIndex((item) => item.title === action.payload.title)

            if (index !== -1) {
                state.news[index] = { ...state.news[index], ...action.payload.updated }
            }
        },
        clearNews(state) {
            state.news = []
        }
    }
})


export const {
    addNews,
    removeNews,
    updateNews,
    clearNews,
    setNews
} = newsSlice.actions;
export default newsSlice.reducer