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

export function MockRanks(count: number): RankCardProps[] {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#33FFF6"];
    const names = ["Recruit", "Member", "Sergeant", "Lieutenant", "Captain", "Chief"];

    const mockedRanks: RankCardProps[] = [];

    for (let i = 1; i <= count; i++) {
        mockedRanks.push({
            rank: {
                id: i,
                name: names[i % names.length] + " " + i,
                level: i,
                color: colors[i % colors.length],
                permissions: {
                    manageRanks: i % 5 === 0,
                    manageMembers: i % 3 === 0,
                    manageNews: i % 2 === 0,
                    kickMembers: i % 4 === 0,
                    stashAccess: true,
                },
                description: `This is the description for rank ${i}.`
            }
        });
    }

    return mockedRanks
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