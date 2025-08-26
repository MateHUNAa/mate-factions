import React, { useEffect, useState } from "react";
import { Member } from "./memberTable";
import { fetchNui } from "@/utils/fetchNui";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";

interface Props {
    member: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface FactionRank {
    name: string;
    permissions: string[];
}

export interface FactionRanks {
    [rankId: string]: FactionRank
}

const EditMemberDialog: React.FC<Props> = ({ member, open, onOpenChange }) => {
    const [formData, setFormData] = useState({
        name: "",
        rank: "",
        notes: ""
    })

    const [ranks, setRanks] = useState<FactionRanks>()

    useEffect(() => {
        const fetchRanks = async () => {
            try {
                const { data } = await fetchNui<{ data: FactionRanks }>("requestFactionRanks")
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
                            {/* TODO: Form */}
                        </TabsContent>

                    </TabsList>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default EditMemberDialog;