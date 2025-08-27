import { Edit, Package, Shield, Users, UserX } from "lucide-react";
import React, { useState } from "react";
import { Card } from "../ui/card";

interface RankCardProps {
    rank: {
        id: number;
        name: string;
        level: number;
        color: string;
        permissions: {
            manageRanks: boolean;
            manageMembers: boolean;
            manageNews: boolean;
            kickMembers: boolean;
            stashAccess: boolean;
        }
        description: string;
    }
}

const permissionIcons = {
    manageRanks: Shield,
    manageMembers: Users,
    manageNews: Edit,
    kickMembers: UserX,
    stashAccess: Package
}

const permissionLabels = {
    manageRanks: "Manage Ranks",
    manageMembers: "Manage Members",
    manageNews: "Manage News",
    kickMembers: "Kick Members",
    stashAccess: "Stash Access"
}

const RankCard: React.FC<RankCardProps> = ({ rank }) => {
    const [editOpen, setEditOpen] = useState<boolean>(false)
    const activePermissions = Object.entries(rank.permissions).filter(([_, value]) => value).map(([key, _]) => key as keyof typeof rank.permissions)


    // TODO: Not sure tbh
    const getRankLevelBadge = (level: number) => {
        if (level >= 9) return { variant: "destructive" as const, label: "ADMIN" }
        if (level >= 7) return { variant: "default" as const, label: "MOD" }
        if (level >= 5) return { variant: "secondary" as const, label: "VIP" }
        return { variant: "outline" as const, label: "MEMBER" }
    }

    const levelBadge = getRankLevelBadge(rank.level)

    return (
        <>
            <Card className="bg-card border-border hover:border-primary/20 transition-colors">

            </Card>
        </>
    );
};

export default RankCard;