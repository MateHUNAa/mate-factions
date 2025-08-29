import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { MapPin, Send, Star, Users } from "lucide-react";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { fetchNui } from "@/utils/fetchNui";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useFaction } from "@/hooks/useFaction";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface NearbyPlayer {
    id: number;
    identifier: string;
    distance: number;
    avatar: string;
    name: string;
}

const InviteMembersDialog: React.FC<Props> = ({ open, onOpenChange }) => {
    const [selectedPlayer, setSelectedPlayer] = useState("")
    const [nearbyPlayers, setNearbyPlayers] = useState<NearbyPlayer[]>([])

    const { selectedFaction } = useFaction()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: NearbyPlayer[] }>("requsetNearbyPlayers", {
                    factionId: selectedFaction?.id
                })
                setNearbyPlayers(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [])

    const handleInvite = () => {
        if (selectedPlayer) {
            const player = nearbyPlayers.find((p) => p.identifier == selectedPlayer)
            console.log(`Inviteing: ${player?.name}`)
            onOpenChange(false)
            setSelectedPlayer("")

            fetchNui("inviteMember", {
                target: player?.identifier,
                factionId: selectedFaction?.id || -1
            })
        }
    }


    const selectedPlayerData = nearbyPlayers.find((p) => p.identifier == selectedPlayer)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white font-heading flex items-center gap-2">
                        <Users />
                        Invite Players
                    </DialogTitle>
                    <DialogDescription className="text-gray-300">
                        Select a nearby player to invite to your faction. Players withing X range are shown.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nearby-player" className="text-sm font-medium text-white">
                            Select Player
                        </Label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                            <SelectTrigger id="nearby-player" className="border-zinc-600/90 border border-zinc-400 text-white placeholder:text-white p-8">
                                <SelectValue className="placeholder:text-white text-white" placeholder="Select nearby player..." />
                            </SelectTrigger>

                            <SelectContent className="bg-zinc-900 text-white">
                                {
                                    nearbyPlayers.map((player) => (
                                        <SelectItem value={player.identifier} key={player.identifier}>
                                            <div className="flex items-center gap-3 w-full">
                                                <Avatar className="size-12">
                                                    <AvatarFallback className="text-xs bg-zinc-400/10 text-gray-400">{player.name}</AvatarFallback>
                                                    <AvatarImage src={player.avatar} />
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{player.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                                        <MapPin className="size-5" />
                                                        {player.distance}km
                                                        {/* <span className="text-lg">•</span> */}
                                                        {/* <span className="text-lg">•</span> */}

                                                    </div>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))
                                }
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Selected Player Preview */}

                    {/* {selectedPlayerData && (
                        <Card className="border">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-10">
                                        <AvatarFallback >{selectedPlayerData?.name}</AvatarFallback>
                                        <AvatarImage src={selectedPlayerData.avatar} />
                                    </Avatar>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-white">{selectedPlayerData.name}</h4>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="size-3" />
                                                {selectedPlayerData.distance} away
                                            </div>


                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )} */}

                </div>

                <DialogFooter className="p-2 text-white/90">
                    <Button type="button" variant={"outline"} onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>

                    <Button type="submit" variant={"outline"} onClick={handleInvite} disabled={!selectedPlayer} className="gap-2">
                        <Send className="size-4 " />
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InviteMembersDialog;