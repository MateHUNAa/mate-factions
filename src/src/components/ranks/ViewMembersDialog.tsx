import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useMembers } from "@/hooks/useMembers";
import { Clock, FoldHorizontal, MessageSquare, MoreHorizontal, Search, Users } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import dayjs from "dayjs";
import { formatDistanceToNow } from "date-fns";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rank: {
        id: number;
        name: string;
        color: string;
        permissions: string[];
        description: string;
    },
}

const ViewMembersDialog: React.FC<Props> = ({ onOpenChange, open, rank }) => {
    const [searchQuery, setSearchQuery] = useState("")
    const members = useMembers()

    const rankMembers = members.filter((member) => member.rank.id == rank.id)
    const filteredMembers = rankMembers.filter((member) => member.name.toLowerCase().includes(searchQuery.toLowerCase()))

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
                return { variant: "outline" as const, className: "text-muted-foreground" }
            default:
                return { variant: "outline" as const, className: "text-muted-foreground" }
        }
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] text-white bg-zinc-900/90">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <Avatar style={{ backgroundColor: rank.color }}>
                            <AvatarFallback className="text-white font-bold text-sm">
                                {rank.name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <span>{rank.name} Members</span>
                        <Badge variant={"outline"} className="ml-auto">
                            {filteredMembers.length} of {members.length}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="sapce-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-white" />
                        <Input
                            placeholder="Search members..."
                            value={searchQuery}
                            onChange={({ target }) => setSearchQuery(target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Members List */}
                    <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-3">
                            {filteredMembers.map((member) => {
                                const statusBadge = getStatusBadge(member.status)

                                return (
                                    <div key={member.identifier}
                                        className="flex items-center justify-between p-4 rounded-lg border border-zinc-700 hover:bg-zinc-900/80 transition-colors mt-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <Avatar className="bg-zinc-600">
                                                    <AvatarFallback className="font-semibold">
                                                        {member.name.charAt(0)}
                                                    </AvatarFallback>
                                                    <AvatarImage src={member.avatar} />
                                                </Avatar>
                                                <div
                                                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-white">{member.name}</h4>
                                                    <Badge {...statusBadge}>{member.status}</Badge>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span>SOME DATA HERE</span>
                                                    <span>•</span>
                                                    <span>SOME DATA HERE</span>
                                                    <span>•</span>
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(member.lastActive)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild className="group">
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="size-4 group-hover:text-gray-400" />
                                                </Button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="gap-2">
                                                    <MessageSquare className="size-4" />
                                                    Send Message
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2">
                                                    <Users className="size-4" />
                                                    View Profile
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>

                    {filteredMembers.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No members found matching your search.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ViewMembersDialog;