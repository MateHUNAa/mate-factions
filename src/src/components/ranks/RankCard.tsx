import { Edit, MoreHorizontal, Package, Shield, Trash, Users, UserX } from "lucide-react";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import EditRankDialog from "./EditRankDialog";
import { fetchNui } from "@/utils/fetchNui";
import { countMembersInRank, useMembers } from "@/hooks/useMembers";

export interface RankCardProps {
    rank: {
        id: number;
        name: string;
        color: string;
        permissions: string[];
        description: string;
    },
    className?: string;
}

const permissionIcons: Record<string, any> = {
    manageRanks: Shield,
    manageMembers: Users,
    manageNews: Edit,
    kickMembers: UserX,
    stashAccess: Package
}

const permissionLabels: Record<string, string> = {
    manageRanks: "Manage Ranks",
    manageMembers: "Manage Members",
    manageNews: "Manage News",
    kickMembers: "Kick Members",
    stashAccess: "Stash Access"
}

const possiblePermissions: Record<string, boolean> = {
    manageRanks: true,
    manageMembers: true,
    manageNews: true,
    kickMembers: true,
    stashAccess: true,
}

const RankCard: React.FC<RankCardProps> = React.memo(({ rank, className }) => {
    const [editOpen, setEditOpen] = useState<boolean>(false)
    const activePermissions = Object.entries(rank.permissions).filter(([_, value]) => value).map(([key, _]) => key as keyof typeof rank.permissions)

    console.log("rankCard Render", rank.name)

    // TODO: Not sure tbh
    const getRankLevelBadge = (level: number) => {
        if (level >= 9) return { variant: "destructive" as const, label: "ADMIN", color: "bg-red-400" }
        if (level >= 7) return { variant: "default" as const, label: "MOD", color: "bg-blue-400" }
        if (level >= 5) return { variant: "secondary" as const, label: "VIP", color: "bg-yellow-400" }
        return { variant: "outline" as const, label: "MEMBER", color: "bg-black" }
    }

    const levelBadge = getRankLevelBadge(rank.id)

    const memberCount = countMembersInRank(rank.id)

    return (
        <>
            <Card className={cn("bg-zinc-800 border-zinc-600 hover:border-zinc-800 transition-colors", className)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-12" style={{ backgroundColor: rank.color }}>
                                <AvatarFallback className="text-white font-bold" style={{ backgroundColor: rank.color }}>
                                    {rank.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-heading text-lg font-semibold text-white/80">{rank.name}</h3>
                                    <Badge className={cn("text-white rounded-sm", levelBadge.color)} {...levelBadge}>{levelBadge.label}</Badge>
                                    <Badge variant="outline" className="text-xs rounded-sm text-white bg-zinc-900/40">
                                        Level {rank.id}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-400">{rank.description}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Users className="h-4 w-4 text-green-400" />
                                        {`${memberCount}`} members
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-400">
                                        <Shield className="h-4 w-4 text-blue-400" />
                                        {activePermissions.length} permissions
                                    </div>
                                </div>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={"ghost"} size={"icon"} className="size-8 text-white">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end" className="bg-zinc-900 border-0 ring-2 ring-zinc-700">

                                <DropdownMenuItem className="gap-2 text-gray-400 focus:text-gray-200" onClick={() => setEditOpen(true)}>
                                    <Edit className="size-4" />
                                    Edit Rank
                                </DropdownMenuItem>

                                <DropdownMenuItem className="gap-2 text-gray-400 focus:text-gray-200">
                                    <Users className="size-4" />
                                    View Members
                                </DropdownMenuItem>

                                <DropdownMenuItem className="gap-2 text-red-400 focus:text-rose-500" onClick={() => fetchNui("removeRank", rank)}>
                                    <Trash className="size-4" />
                                    Delete Rank
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Permission grid */}

                    <div className="space-y-3">
                        <h4 className="text-sm font-medium text-white">Permissions</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {
                                Object.keys(possiblePermissions).map((perm) => {
                                    const Icon = permissionIcons[perm] || Shield
                                    const label = permissionLabels[perm] || perm
                                    const hasPerm = rank.permissions.includes(perm)

                                    return (
                                        <div
                                            key={perm}
                                            className={`flex items-center gap-2 p-2 rounded-md text-xs font-semibold ${hasPerm ? "bg-green-500/10 text-green-400" : "bg-zinc-700 text-white font-normal "}`}>
                                            <Icon className="size-3 flex-shrink-0" />
                                            <span className="truncate">
                                                {label}
                                            </span>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>

                </CardContent>
            </Card>

            <EditRankDialog rank={rank} onOpenChange={setEditOpen} open={editOpen} />
        </>
    );
});

export default RankCard;