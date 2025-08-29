import InfoCard, { InfoCardBox } from "@/components/InfoCard";
import CreateRankDialog from "@/components/ranks/CreateRankDialog";
import RankCard from "@/components/ranks/RankCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Settings, Shield, Users } from "lucide-react";
import React, { useMemo } from "react";
import { useMembers } from "@/hooks/useMembers";
import { useRanks } from "@/hooks/useRanks";

interface Props {
}



const Ranks: React.FC<Props> = ({ }) => {
    const ranksData = useRanks()
    const members = useMembers()

    const { rankCounts, topRankId, topRankCount, topRankName } = useMemo(() => {
        const rankCounts: Record<number, number> = {};

        members.forEach((m) => {
            if (!rankCounts[m.rank.id]) rankCounts[m.rank.id] = 0;
            rankCounts[m.rank.id]++;
        });

        let topRankId: number | null = null;
        let topRankCount = 0;

        for (const [rankIdStr, count] of Object.entries(rankCounts)) {
            const rankId = Number(rankIdStr);
            if (count > topRankCount) {
                topRankCount = count;
                topRankId = rankId;
            }
        }

        const topRankName =
            ranksData.find((r) => r.id === topRankId)?.name ?? "N/A";

        return { rankCounts, topRankId, topRankCount, topRankName };
    }, [members, ranksData]);

    const sortedRanks = useMemo(() => {
        return [...ranksData].sort((a, b) => b.id - a.id)
    }, [ranksData])


    if (!ranksData || ranksData.at.length <= 0) return null

    return (
        <main className="flex-1 overflow-auto space-y-5">
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-heading text-3xl font-bold text-white">Rank Managment</h1>
                        <p className="text-gray-400">Manage ranks, permission, and hierarchy</p>
                    </div>
                    <CreateRankDialog />
                </div>
            </div>

            {/* Stats Card */}

            <InfoCardBox>
                <InfoCard title="Total Ranks" Icon={Shield} content={`${ranksData.length}`} />
                <InfoCard title="Members on Duty" Icon={Settings} content={`${members.filter(m => m.status === "online").length}`} />
                <InfoCard
                    title="Most Popular Rank"
                    Icon={Shield}
                    content={`${topRankName} ${topRankCount}`}
                />
                <InfoCard title="Total Members" Icon={Users} content={`${members.length}`} />
            </InfoCardBox>

            {/* Search and Filters */}

            <Card className="bg-zinc-800/80 border-zinc-500">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white" />
                            <Input placeholder="Search ranks..." className="pl-10 bg-input border-zinc-600 text-white" />
                        </div>
                        <div className="flex gap-2 text-white">
                            <Badge variant="secondary">All Ranks</Badge>
                            <Badge variant="outline">Admin Only</Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Ranks Hierarchy */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Shield className="size-5 text-blue-400" />
                    <h2 className="font-heading text-xl font-semibold text-white">Rank Hierarchy</h2>
                    <Badge variant={"outline"} className="ml-auto text-white rounded-sm">
                        Sorted by level
                    </Badge>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[calc(5*6.4rem)] snap-y snap-mandatory">
                    {sortedRanks.map((rank) => (
                        <RankCard key={rank.id} rank={rank} className="snap-start mr-2" memberCount={rankCounts[rank.id]} />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Ranks;