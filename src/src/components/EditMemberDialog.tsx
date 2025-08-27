import React, { useEffect, useState } from "react";
import { Member } from "./MemberTable";
import { fetchNui } from "@/utils/fetchNui";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { isEnvBrowser } from "@/utils/misc";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, Divide, Mail, MessageSquare, UserX } from "lucide-react";
import { Button } from "./ui/button";
import { P } from "framer-motion/dist/types.d-Cjd591yU";

interface Props {
    member: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FactionRank {
    name: string;
    permissions: string[];
    id: number;
    color: string;
    description: string;
}

export const MockFactionRanks = (count: number): FactionRank[] => {
    const ranks: FactionRank[] = [];
    const colors = ["#0ea5e9", "#22c55e", "#facc15", "#f87171", "#a855f7", "#f97316"];

    for (let i = 1; i <= count; i++) {

        const color = colors[Math.floor(Math.random() * colors.length)]
        ranks.push({
            id: i,
            name: `Rank ${i}`,
            permissions: [`perm_${i}_a`, `perm_${i}_b`, "stashAccess"],
            color,
            description: `description_${i}`
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

    const [ranks, setRanks] = useState<FactionRank[]>()

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                if (isEnvBrowser()) {
                    const data = MockFactionRanks(5)
                    setRanks(data)
                    return;
                }

                const { data } = await fetchNui<{ data: FactionRank[] }>("requestFactionRanks")
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

    const selectedRank = ranks?.find((rank) => rank.name === formData.rank)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] min-h-[60vh] overflow-y-auto bg-zinc-800/80 border-zinc-700/80">
                <DialogHeader>
                    <DialogTitle className="font-heading text-white">
                        Edit Meber: {member.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Manage member information, rank, and permissions.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 text-white/80 space-x-2">
                        <TabsTrigger className="bg-zinc-600/80 data-[state=active]:bg-zinc-800 border-2 border-zinc-900 data-[state=active]:border-zinc-700" value="profile">Profile</TabsTrigger>
                        <TabsTrigger className="bg-zinc-600/80 data-[state=active]:bg-zinc-800 border-2 border-zinc-900 data-[state=active]:border-zinc-700" value="activity">Activity</TabsTrigger>
                        <TabsTrigger className="bg-zinc-600/80 data-[state=active]:bg-zinc-800 border-2 border-zinc-900 data-[state=active]:border-zinc-700" value="moderation">Moderation</TabsTrigger>
                    </TabsList>

                    {/* PROFILE */}
                    {/* PROFILE */}
                    {/* PROFILE */}

                    <TabsContent value="profile" className="space-y-4 min-h-[36vh]">
                        <div className="flex items-center gap-4 p-2 ring-2 ring-zinc-700 rounded-lg bg-zinc-800/80">
                            <Avatar className="size-16">
                                <AvatarFallback className="text-lg items-center gap-4 p-4 rounded-lg bg-zinc-800/80">
                                    {member.name}
                                </AvatarFallback>
                                <AvatarImage src={member.avatar} />
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

                                    <SelectContent className="bg-zinc-900" position="item-aligned">
                                        {ranks?.map((rank) => (
                                            <SelectItem value={rank.name} key={rank.id} className="bg-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    <div className="size-3 rounded-full" style={{ backgroundColor: rank.color }} />
                                                    {rank.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {selectedRank && (
                                    <p className="text-xs text-gray-400">This will change the member's raml to {selectedRank.name}</p>
                                )}
                            </div>
                        </form>
                    </TabsContent>

                    {/* ACTIVITY */}
                    {/* ACTIVITY */}
                    {/* ACTIVITY */}

                    <TabsContent value="activity" className="space-y-4 min-h-[36vh]">
                        <div className="grid grid-cols-2 gap-4">

                            <Card className="bg-zinc-800/80 ring-2 ring-zinc-700 border-0">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                                        <MessageSquare className="size-4 text-white" />
                                        Total Posts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-400">
                                        {member.totalPosts.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-800/80 ring-2 ring-zinc-700 border-0">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                                        <Calendar className="size-4 text-white" />
                                        Join Date
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-400">
                                        {member.joinDate}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-800/80 ring-2 ring-zinc-700 border-0">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2 text-white">
                                        <Calendar className="size-4 text-white" />
                                        Last Active
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-gray-400">
                                        {member.lastActive}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </TabsContent>


                    {/* MODERATION */}
                    {/* MODERATION */}
                    {/* MODERATION */}

                    <TabsContent value="moderation" className="space-y-4  min-h-[36vh]">
                        <div className="space-y-4">

                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/80 ring-2 ring-zinc-700">
                                <div>
                                    <h4 className="font-medium text-white">Send Warning</h4>
                                    <p className="text-sm text-gray-400">Send a private warning message to this member</p>
                                </div>
                                <Button variant={"outline"} size={"sm"} className="gap-2 bg-transparent">
                                    <Mail className="size-4" />
                                    Send Warning
                                </Button>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/80 ring-2 ring-zinc-700">
                                <div>
                                    <h4 className="font-medium text-white">Kick Member</h4>
                                    <p className="text-sm text-gray-400">Kick member from the Faction.</p>
                                </div>
                                <Button variant={"outline"} size={"sm"} className="gap-2 bg-transparent text-yellow-400 hover:text-yellow-300">
                                    <UserX className="size-4" />
                                    Kick Member
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/80 ring-2 ring-zinc-700">
                                <div>
                                    <h4 className="font-medium text-white">Kick Member</h4>
                                    <p className="text-sm text-gray-400">Kick member from the Faction.</p>
                                </div>
                                <Button variant={"outline"} size={"sm"} className="gap-2 bg-transparent text-yellow-400 hover:text-yellow-300">
                                    <UserX className="size-4" />
                                    Kick Member
                                </Button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/80 ring-2 ring-zinc-700">
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
                </Tabs>

                <DialogFooter className="p-2 text-white/90">
                    <Button type="button" variant={"outline"} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button type="submit" variant={"outline"} onClick={handleSubmit}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditMemberDialog;