import { Member } from "@/store/memberSlice";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useRanks } from "@/hooks/useRanks";
import { useUser } from "@/store/userSlice";
import { useFaction } from "@/hooks/useFaction";
import { Button } from "../ui/button";

interface Props {
    member: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChangeRankDialog: React.FC<Props> = ({ member, onOpenChange, open }) => {
    const [selectedRank, setSelectedRank] = useState<string>()

    if (!member) return null

    const ranks = useRanks()
    const user = useUser()
    const { selectedFaction } = useFaction()
    const userRankId = user?.factions.find((f) => f.id == selectedFaction?.id)?.rank?.id || 1

    const newRank = ranks.find((rank) => rank.name == selectedRank)
    const currentRank = ranks.find((rank) => rank.id == userRankId)

    const handleSubmit = () => {

    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-800/80 border-zinc-700/80">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                        <Shield className="text-blue-400" />
                        Change Member Rank
                    </DialogTitle>
                    <DialogDescription className="text-white font-medium">
                        Update the rank for this member, This will change their permissions and access level.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-700/50">
                        <Avatar>
                            <AvatarFallback className="text-white">
                                {member.name}
                            </AvatarFallback>
                            <AvatarImage src={member.avatar} />
                        </Avatar>
                        <div>
                            <div className="font-medium text-white">{member.name}</div>
                        </div>
                    </div>

                    {/* Current Rank */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Current Rank
                        </Label>
                        <div className="flex items-center gap-2">
                            <>
                                <Badge variant={"outline"} className="rounded-sm" style={{ borderColor: member.rank.color, color: member.rank.color }}>
                                    {member.rank.name}
                                </Badge>
                                <span className="text-xs text-white">Level {member.rank.id}</span>
                            </>
                        </div>
                    </div>

                    {/* New Rank Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="rank-select" className="text-sm font-medium">
                            New Rank
                        </Label>
                        <Select value={selectedRank} onValueChange={setSelectedRank}>
                            <SelectTrigger id="rank-select" className="border-zinc-700/80 text-white placeholder:text-white">
                                <SelectValue className="placeholder:text-white text-white" placeholder="Select a new rank" />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-900 text-white">
                                {ranks.filter((r) => Number(r.id) <= userRankId).sort((a, b) => b.id - a.id)?.map((rank) => (
                                    <SelectItem value={rank.name} key={rank.id} className="bg-zinc-800">
                                        <div className="flex items-center gap-2">
                                            <span>{rank.name}</span>
                                            <span className="text-xs text-muted-foreground ml-auto">Level {rank.id}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Rank Comparison */}
                    {selectedRank && newRank && (
                        <>
                            <div className="p-3 rounded-lg border bg-zinc-700 ">
                                <div className="text-sm font-medium mb-2">Rank Change Preview</div>

                                <div className="flex items-center justify-between text-sm bg-zinc-800 p-1 rounded-md">
                                    <div className="flex items-center gap-2">
                                        {currentRank && (
                                            <>
                                                <span style={{ color: currentRank.color }}>{currentRank.name}</span>
                                            </>
                                        )}
                                    </div>
                                    <span className="text-white">→</span>
                                    <div className="flex items-center gap-2">
                                        <span style={{ color: newRank.color }}>{newRank.name}</span>
                                    </div>
                                </div>
                            </div>
                        </>

                    )}
                </div>


                <DialogFooter className="p-2 text-white/90">
                    <Button type="button" variant={"outline"} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button type="submit" variant={"outline"} onClick={handleSubmit} disabled={!selectedRank || selectedRank === member.rank.name}>
                        Change Rank
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChangeRankDialog;