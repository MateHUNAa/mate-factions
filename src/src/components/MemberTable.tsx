import { fetchNui } from "@/utils/fetchNui";
import React, { useEffect, useState } from "react";

export interface Member {
    identifier: string;
    rank: string;
    rankColor: string;
    joinDate: string;
    lastActive: string;
    status: string;
    avatar: string;
    totalPosts: number;
    reputation?: number; // NOT USED YET
}

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
            return { variant: "default" as const, className: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
        default:
            return { variant: "default" as const, className: "bg-gray-500/10 text-gray-400 border-gray-500/20" }
    }
}

const MemberTable: React.FC = ({ }) => {
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [editingMember, setEditingMember] = useState<Member | null>(null)
    const [members, setMembers] = useState<Member[]>()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await fetchNui<{ data: Member[] }>("requestFactionMembers")
                setMembers(data)
            } catch (error) {
                console.error("Error:", error);
            }
        };

        fetchData();
    }, [])



    if (!members || members.length <= 0) return null // TODO: Return a loading state!

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedMembers(members?.map((member) => member.identifier))
        } else {
            setSelectedMembers([])
        }
    }

    const handleSelectMember = (memberId: string, checked: boolean) => {
        if (checked) {
            setSelectedMembers([...selectedMembers, memberId])
        } else {
            setSelectedMembers(selectedMembers.filter((identifier) => identifier !== memberId))
        }
    }


    return (
        <>

        </>
    );
};

export default MemberTable;