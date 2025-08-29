import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchNui } from "@/utils/fetchNui";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useFaction } from "@/hooks/useFaction";
import { cn } from "@/lib/utils";
import { NewsItem } from "@/store/newsSlice";
import { useNews } from "@/hooks/useNews";


const getBadgeColor = (category: NewsItem["category"]): string => {
    switch (category) {
        case "update":
            return "bg-blue-500 text-zinc-900";
        case "event":
            return "bg-green-500 text-white";
        case "notice":
            return "bg-yellow-500 text-black";
        case "guide":
            return "bg-purple-500 text-white";
        case "announcement":
            return "bg-red-500 text-white";
        default:
            return "bg-gray-500 text-white";
    }
};

const News: React.FC = ({ }) => {
    const news = useNews()




    const sortedNews = news ? [...news].sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }) : [];

    return (
        <Card className="bg-zinc-800/80 border-zinc-700/80">
            <CardHeader>
                <CardTitle className="text-white font-heading">Latest News</CardTitle>
                <CardDescription className="text-gray-300">Recent updates and announcements</CardDescription>
            </CardHeader>

            {!news || news.length <= 0
                ? // no News
                <CardContent>
                    <h1>No news could be loaded !</h1>
                </CardContent>
                : // Have news
                <CardContent className="sapce-y-4">
                    <div className="flex flex-col gap-3 max-h-[calc(4*5rem)] overflow-y-auto scroll-smooth snap-y snap-mandatory m-1 space-y-3">
                        {sortedNews.map((item, index) => (
                            <div key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-700 shadow-lg hover:bg-zinc-900/90 group">
                                <div className={cn("h-2 w-2 rounded-full bg-blue-400 mt-2 flex-shrink-0 p-1", getBadgeColor(item.category))} />
                                <div className="flex-1 min-w-0 space-y-2">
                                    <h4 className="font-medium text-white truncate">{item.title}</h4>
                                    <p className="text-sm text-gray-400 bg-zinc-600/20 rounded-md p-1 truncate group-hover:bg-zinc-700/40">
                                        {item.content}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={"outline"} className={cn("rounded-md border-0 ring-1 ring-zinc-700 font-bold", getBadgeColor(item.category))}>{item.category}</Badge>
                                        <span className="text-xs text-gray-400 font-semibold">{formatDistanceToNow(item?.createdAt || new Date(), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            }

        </Card>
    );
};

export default News;