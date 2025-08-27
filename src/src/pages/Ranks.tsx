import { FactionRank, MockFactionRanks } from "@/components/members/EditMemberDialog";
import InfoCard, { InfoCardBox } from "@/components/InfoCard";
import CreateRankDialog from "@/components/ranks/CreateRankDialog";
import RankCard, { RankCardProps } from "@/components/ranks/RankCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { fetchNui } from "@/utils/fetchNui";
import { isEnvBrowser } from "@/utils/misc";
import { Search, Settings, Shield, SortAsc, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

interface Props {
}



const Ranks: React.FC<Props> = ({ }) => {
    const [totalMembers, setTotalMembers] = useState()

    const [ranksData, setRanks] = useState<FactionRank[]>()

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (isEnvBrowser()) {
                    setRanks(MockFactionRanks(10))
                    return
                }
                const { data } = await fetchNui<{ data: FactionRank[] }>("requsetFactionRanks")
                setRanks(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [])

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
                <InfoCard title="Total Ranks" Icon={Shield} content="8" />
                <InfoCard title="Admin Ranks" Icon={Settings} content="8" />
                <InfoCard title="Member Ranks" Icon={Users} content="8" />
                <InfoCard title="Total Members" Icon={Users} content="8" />
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
                    {ranksData.sort((a, b) => b.id - a.id).map((rank) => (
                        <RankCard key={rank.id} rank={rank} className="snap-start mr-2" />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default Ranks;