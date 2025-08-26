import { fetchNui } from "@/utils/fetchNui";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Edit, Eye, MoreHorizontal, Shield, UserX } from "lucide-react";
import EditMemberDialog from "./EditMemberDialog";

export interface Member {
    identifier: string;
    rank: string;
    rankColor: string;
    joinDate: string;
    lastActive: string;
    status: string;
    avatar: string;
    totalPosts: number;
    reputation?: number; // NOT USED YET
    name: string;
    faction: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "online":
            return "bg-green-500"
        case "away":
            return "bg-yellow-500"
        case "offline":
            return "bg-gray-500"
        default:
            return "bg-gray-500"
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "online":
            return { variant: "default" as const, className: "bg-green-500/10 text-green-400 border-green-500/20" }
        case "away":
            return { variant: "secondary" as const, className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" }
        case "offline":
            return { variant: "default" as const, className: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
        default:
            return { variant: "default" as const, className: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
    }
}


const MockMembers = (count: number): Member[] => {
    const members: Member[] = []

    for (let i = 0; i < count; i++) {

    }

    return members
}

const MemberTable: React.FC = ({ }) => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [members, setMembers] = useState<Member[]>()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: Member[] }>("requestFactionMembers")
                setMembers(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [])



    if (!members || members.length <= 0) return null // TODO: Return a loading state!

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMembers(members?.map((member) => member.identifier))
        } else {
            setSelectedMembers([])
        }
    }

    const handleSelectMember = (memberId: string, checked: boolean) => {
        if (checked) {
            setSelectedMembers([...selectedMembers, memberId])
        } else {
            setSelectedMembers(selectedMembers.filter((identifier) => identifier !== memberId))
        }
    }


    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow className="border-zinc-700/80">
                        <TableHead className="w-12">
                            <Checkbox
                                checked={selectedMembers.length === members.length}
                                onCheckedChange={handleSelectAll}
                                aria-label="Select all members"
                            />
                        </TableHead>
                        <TableHead className="text-gray-400">Member</TableHead>
                        <TableHead className="text-gray-400">Rank</TableHead>
                        <TableHead className="text-gray-400">Status</TableHead>
                        <TableHead className="text-gray-400">Join Date</TableHead>
                        <TableHead className="text-gray-400">Last Active</TableHead>
                        <TableHead className="text-gray-400">Posts</TableHead>
                        <TableHead className="text-gray-400">Reputation</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {members.map((member) => {
                        const statusBadge = getStatusBadge(member.status)
                        return (
                            <TableRow key={member.identifier} className="border-zinc-700/80 border:border-zinc-700/70">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedMembers.includes(member.identifier)}
                                        onCheckedChange={(checked) => handleSelectMember(member.identifier, checked as boolean)}
                                        aria-label={`Select ${member.name}`}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="size-8">
                                                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                    {member.avatar}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}>
                                            </div>
                                            <div>
                                                <div className="font-medium text-white">{member.name}</div>
                                                <div className="text-xs text-gray-400">Member.Email</div>
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={"default"} style={{ borderColor: member.rankColor, color: member.rankColor }}>
                                        {member.rank}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground">{member.joinDate}</TableCell>
                                <TableCell className="text-muted-foreground">{member.lastActive}</TableCell>
                                <TableCell className="text-card-foreground">{member.totalPosts.toLocaleString()}</TableCell>
                                {member.reputation && <TableCell className="text-card-foreground">{member.reputation.toLocaleString()}</TableCell>} {/** Unused */}
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant={"ghost"} size={"icon"} className="size-8">
                                                <MoreHorizontal className="size-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingMember(member)} className="gap-2">
                                                <Edit className="size-4" />
                                                Edit Member
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Shield className="size-4" />
                                                Change Rank
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <UserX className="size-4" />
                                                Kick Member
                                            </DropdownMenuItem>
                                            {/* TODO: Add other features here */}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {editingMember && <EditMemberDialog member={editingMember} open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)} />}
        </>
    );
};

export default MemberTable;