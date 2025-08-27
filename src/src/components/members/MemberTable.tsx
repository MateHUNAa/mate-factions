import { fetchNui } from "@/utils/fetchNui";
import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Edit, Eye, MoreHorizontal, Shield, UserX } from "lucide-react";
import EditMemberDialog from "./EditMemberDialog";
import { isEnvBrowser } from "@/utils/misc";
import dayjs from "dayjs";
import { Rank } from "@/lib/permission";
import { Member, MockMembers } from "@/store/memberSlice";
import { useMembers } from "@/hooks/useMembers";

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

const MemberTable: React.FC = () => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [editingMember, setEditingMember] = useState<Member | null>(null)


    const members = useMembers()

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
            <div className="max-h-[calc(4*6rem)] overflow-y-scroll scroll-smooth snap-y snap-mandatory rounded-md">
                <Table>
                    <TableHeader className="bg-zinc-800/70">
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
                            <TableHead className="w-12"></TableHead>

                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {members.map((member) => {
                            const statusBadge = getStatusBadge(member.status)

                            return (
                                <TableRow key={member.identifier} className="bg-zinc-800/80 border-zinc-700/80 border:border-zinc-700/70 snap-start">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedMembers.includes(member.identifier)}
                                            onCheckedChange={(checked) => handleSelectMember(member.identifier, checked as boolean)}
                                            aria-label={`Select ${member.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex items-center">

                                                <div className="block relative">
                                                    <Avatar className="size-8">
                                                        <AvatarFallback className="text-xs bg-primary text-white">
                                                            {member.avatar}
                                                        </AvatarFallback>
                                                        <AvatarImage src={member.avatar} />

                                                    </Avatar>

                                                    <div
                                                        className={`absolute z-10 bottom-0 right-0 size-3 rounded-full border-2 border-zinc-700/80 ${getStatusColor(member.status)}`}
                                                    />
                                                </div>


                                                <div>
                                                    <div className="font-medium text-white ml-1">{member.name}</div>
                                                    {/* <div className="text-xs text-gray-400">Member.Email</div> */}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={"default"} style={{ borderColor: member.rank.color, color: member.rank.color }}>
                                            {member.rank.name}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge {...statusBadge} className={statusBadge.className}>
                                            {member.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-white">{dayjs(member.joinDate).format("MMMM D, YYYY h:mm A")}</TableCell>
                                    <TableCell className="text-white">{dayjs(member.lastActive).format("MMMM D, YYYY h:mm A")}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant={"ghost"} size={"icon"} className="size-8">
                                                    <MoreHorizontal className="size-4 text-white" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-zinc-900/65 text-white">

                                                <DropdownMenuItem onClick={() => setEditingMember(member)} className="gap-2 hover:bg-zinc-700">
                                                    <Edit className="size-4" />
                                                    Edit Member
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="hover:bg-zinc-700">
                                                    <Shield className="size-4" />
                                                    Change Rank
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="hover:bg-zinc-700">
                                                    <UserX className="size-4" />
                                                    Kick Member
                                                </DropdownMenuItem>

                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table >
            </div>

            {editingMember && <EditMemberDialog member={editingMember} open={!!editingMember} onOpenChange={(open) => !open && setEditingMember(null)} />
            }
        </>
    );
};

export default MemberTable;