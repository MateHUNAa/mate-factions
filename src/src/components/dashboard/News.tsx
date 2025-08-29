import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchNui } from "@/utils/fetchNui";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { isEnvBrowser } from "@/utils/misc";
import { useFaction } from "@/hooks/useFaction";


type NewsItem = {
    title: string;
    description: string;
    badgeText: string;
    badgeVariant?: "default" | "secondary" | "outline" | "destructive";
    timestamp?: Date;
    color?: string;
}

const badgeOptions: Array<{ text: string; variant: NewsItem["badgeVariant"] }> = [
    { text: "Update", variant: "secondary" },
    { text: "Event", variant: "default" },
    { text: "Notice", variant: "destructive" },
    { text: "Patch", variant: "default" },
];
const colors = ["#0ea5e9", "#22c55e", "#facc15", "#f87171", "#a855f7", "#f97316"];

function MockNews(count: number): NewsItem[] {

    const news: NewsItem[] = [];

    for (let i = 0; i < count; i++) {
        const title = `Title ${i + 1}`
        const description = `Description ${i + 1}`
        const badge = badgeOptions[Math.floor(Math.random() * badgeOptions.length)]
        const color = colors[Math.floor(Math.random() * colors.length)]
        const timestamp = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))


        news.push({
            title,
            description,
            badgeText: badge.text,
            badgeVariant: badge.variant,
            color,
            timestamp
        })
    }

    return news;
}

const News: React.FC = ({ }) => {
    const [news, setNews] = useState<NewsItem[]>()
    const { selectedFaction } = useFaction()
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) {
                    setNews(MockNews(10))
                    return
                }
                const { data } = await fetchNui<{ data: NewsItem[] }>("requestNews", { factionId: selectedFaction?.id })
                setNews(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [])

    if (news && news.length > 0) {
        news.sort((a, b) => {
            return b.timestamp!.getTime() - a.timestamp!.getTime();
        });
    }

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
                    <div className="flex flex-col gap-3 max-h-[calc(4*5rem)] overflow-y-auto scroll-smooth snap-y snap-mandatory">
                        {news.map((item, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/80 hover:bg-zinc-900/50 cursor-pointer transition snap-start mr-4"
                            >
                                <div
                                    className={`h-2 w-2 rounded-full mt-2 flex-shrink-0`}
                                    style={{ backgroundColor: item.color || "#0ea5e9" }}
                                />
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white  truncate">{item.title}</h4>
                                    <p className="text-sm text-gray-300  truncate">{item.description}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={item.badgeVariant || "default"} style={{ color: item.color || "#FFFFFF" }} className="truncate">{item.badgeText}</Badge>
                                        {item.timestamp && (
                                            <span className="text-xs text-gray-300">
                                                {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                            </span>
                                        )}
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