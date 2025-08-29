import { Rank } from "@/lib/permission";
import { Member } from "@/store/memberSlice";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Shield } from "lucide-react";

interface Props {
    member: Member;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ChangeRankDialog: React.FC<Props> = ({ member, onOpenChange, open }) => {
    const [selectedRank, setSelectedRank] = useState<Rank>()

    if (!member) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Shield className="text-blue-400" />
                        Change Member Rank
                    </DialogTitle>
                    <DialogDescription>
                        Update the rank for this member/ This will change their permissions and access level.
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    );
};

export default ChangeRankDialog;