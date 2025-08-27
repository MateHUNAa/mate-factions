import React, { useEffect, useState } from "react";
import { Member } from "./MemberTable";
import { fetchNui } from "@/utils/fetchNui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectTrigger, SelectValue } from "./ui/select";
import { isEnvBrowser } from "@/utils/misc";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Mail, MessageSquare, UserX } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
    member: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FactionRank {
    name: string;
    permissions: string[];
    id: number;
}

export interface FactionRanks {
    [rankId: string]: FactionRank
}

const MockFactionRanks = (count: number): FactionRanks[] => {
    const ranks: FactionRanks[] = [];

    for (let i = 1; i <= count; i++) {
        const rankId = i.toString(); // string key
        const rank: FactionRank = {
            id: i, // numeric ID matches string key
            name: `Rank ${i}`,
            permissions: [`perm_${i}_a`, `perm_${i}_b`],
        };

        ranks.push({
            [rankId]: rank,
        });
    }

    return ranks;
};

const EditMemberDialog: React.FC<Props> = ({ member, open, onOpenChange }) => {
    const [formData, setFormData] = useState({
        name: "",
        rank: "",
        notes: ""
    })

    const [ranks, setRanks] = useState<FactionRanks[]>()

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                if (isEnvBrowser()) {
                    const data = MockFactionRanks(5)
                    setRanks(data)
                    console.table(data)
                    return;
                }

                const { data } = await fetchNui<{ data: FactionRanks[] }>("requestFactionRanks")
                setRanks(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchRanks();
        setFormData({
            name: member.name,
            rank: member.rank.toLowerCase(),
            notes: ""
        })
    }, [member])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log("Updateing Member: ", formData)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-zinc-800/80 border-zinc-700/80">
                <DialogHeader>
                    <DialogTitle className="font-heading text-white">
                        Edit Meber: {member.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Masnage member information, rank, and permissions.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3    ">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="activity">Activity</TabsTrigger>
                        <TabsTrigger value="moderation">Moderation</TabsTrigger>

                        <TabsContent value="profile" className="space-y-4">
                            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                                <Avatar className="size-16">
                                    <AvatarFallback className="text-lg items-center gap-4 p-4 rounded-lg bg-muted/50">
                                        {member.avatar}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h3 className="font-heading text-lg font-semibold text-white">{member.name}</h3>
                                    <p className="text-sm text-gray-400">member.mail</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Badge variant={"default"} style={{ borderColor: member.rankColor, color: member.rankColor }}>
                                            {member.rank}
                                        </Badge>
                                        <Badge variant={"secondary"}>{member.status}</Badge>
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-gray-400">Username</Label>
                                        <Input
                                            id="username"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="bg-zinc-800/70 border-zinc-700/80 text-white/80"
                                        />
                                    </div>
                                    {/* formData ++ */}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-gray-400">Rank</Label>
                                    <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
                                        <SelectTrigger className="bg-input border-zinc-700/80 text-white">
                                            <SelectValue placeholder="Select rank" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* TODO: loop tru faction ranks */}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </form>
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-muted/50 border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <MessageSquare className="size-4 text-white" />
                                            Total Posts
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {member.totalPosts.toLocaleString()}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-muted/50 border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Calendar className="size-4 text-white" />
                                            Join Date
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {member.joinDate}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-muted/50 border-border">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm flex items-center gap-2">
                                            <Calendar className="size-4 text-white" />
                                            Last Active
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-white">
                                            {member.lastActive}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="moderation" className="space-y-4">
                            <div className="space-y-4">

                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <h4 className="font-medium text-white">Send Warning</h4>
                                        <p className="text-sm text-gray-400">Send a private warning message to this member</p>
                                    </div>
                                    <Button variant={"outline"} size={"sm"} className="gap-2 bg-transparent">
                                        <Mail className="size-4" />
                                        Send Warning
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                                    <div>
                                        <h4 className="font-medium text-white">Kick Member</h4>
                                        <p className="text-sm text-gray-400">Kick member from the Faction.</p>
                                    </div>
                                    <Button variant={"outline"} size={"sm"} className="gap-2 bg-transparent text-yellow-400 hover:text-yellow-300">
                                        <UserX className="size-4" />
                                        Kick Member
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                    </TabsList>
                </Tabs>

                <DialogFooter>
                    <Button variant={"outline"} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button type="submit" onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditMemberDialog;