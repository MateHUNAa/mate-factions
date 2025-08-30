import InfoCard, { InfoCardBox, InfoSubElement } from "@/components/InfoCard";
import MemberTable from "../components/members/MemberTable";
import { Button } from "@/components/ui/button";
import { Filter, Search, UserCheck, UserPlus, Users } from "lucide-react";
import React, { useState } from "react";
import InviteMembersDialog from "@/components/members/InviteMembersDialog";
import { hasPermission } from "@/lib/permission";
import { getUserRankId } from "@/components/Navbar";
import { useUser } from "@/store/userSlice";
import { useFaction } from "@/hooks/useFaction";
import { useRanks } from "@/hooks/useRanks";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const Members: React.FC = () => {
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

    const user = useUser()
    const { selectedFaction, playerFactions } = useFaction()
    const ranks = useRanks()

    if (!user) return null


    const userRankId = getUserRankId(user, selectedFaction || playerFactions[0])

    const [filters, setFilters] = useState({
        search: "",
        rank: "all",
        status: "all"
    })

    return (
        <>
            <main className="flex-1 overflow-auto">
                <div className="p-6 space-y-6">
                    {/* Header */}

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-heading text-3xl font-bold text-white">Member Managment</h1>
                            <p className="text-gray-300">Manage faction members, ranks, and permissions</p>
                        </div>
                        <Button
                            onClick={() => setInviteDialogOpen(true)}
                            disabled={!hasPermission(userRankId, "inviteMembers", ranks)}
                            className="gap-2 bg-white/90 hover:bg-white">
                            <UserPlus className="size-4" />
                            Invite Members
                        </Button>
                    </div>

                    {/* Stats Card */}

                    <InfoCardBox >
                        <InfoCard Icon={Users} title="Total Members" content="6" subContent={<InfoSubElement subContent="+12" content="this month" color="text-green-400" />} />
                        <InfoCard Icon={UserCheck} title="Online Members" content="3" subContent={<InfoSubElement subContent="50%" content="active" color="text-blue-400" />} />
                        <InfoCard Icon={UserPlus} title="New Members" content="2" subContent={<InfoSubElement subContent="+2" content="new members" color="text-white" />} />
                        <InfoCard Icon={UserPlus} title="Unknown" content="2" subContent={<InfoSubElement subContent="+2" content="new members" color="text-white" />} />
                    </InfoCardBox>

                    {/* Search Bar */}
                    <Card className="bg-zinc-800 border border-zinc-700 text-white">
                        <CardContent className="p-4">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search Input */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        value={filters.search}
                                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                        placeholder="Search members by name"
                                        className="pl-10 bg-input border-border text-foreground"
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex gap-2">
                                    <Select value={filters.rank} onValueChange={(v) => setFilters({ ...filters, rank: v })}>
                                        <SelectTrigger className="w-[140px] bg-input border-border text-foreground">
                                            <SelectValue placeholder="All Ranks" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">ALL</SelectItem>
                                            {ranks.map((r) => (
                                                <SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={filters.status} onValueChange={(v) => setFilters({ ...filters, status: v })}>
                                        <SelectTrigger className="w-[140px] bg-input border-border text-foreground">
                                            <SelectValue placeholder="All Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="online">Online</SelectItem>
                                            <SelectItem value="away">Away</SelectItem>
                                            <SelectItem value="offline">Offline</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button variant="outline" size="sm" className="gap-2 bg-transparent h-full">
                                        <Filter className="h-4 w-4" />
                                        More Filters
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Member Table */}

                    <MemberTable filters={filters} />
                </div>
            </main>

            {inviteDialogOpen && <InviteMembersDialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen} />}
        </>
    );
};

export default Members;