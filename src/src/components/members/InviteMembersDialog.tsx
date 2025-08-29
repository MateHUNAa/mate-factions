import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const InviteMembersDialog: React.FC<Props> = ({ open, onOpenChange }) => {
    const [selectedPlayer, setSelectedPlayer] = useState()
    const [seelctedRank, setSelectedRank] = useState()

    const handleInvite = () => {
        if (selectedPlayer) {

        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            
        </Dialog>
    );
};

export default InviteMembersDialog;