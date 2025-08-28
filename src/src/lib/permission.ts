import { RootState } from "@/store"
import { TheaterIcon } from "lucide-react";
import { useSelector } from "react-redux";

export type Permission = string;

export interface Rank {
    id: number;
    name: string;
    color: string;
    permissions: Permission[],
    description: string;
}

export function hasPermission(rankId: number, permission: Permission, ranks: Rank[]): boolean {
    const rank = ranks.find(r => Number(r.id) == rankId);
    // console.log("[hasPermission]", rank?.permissions, permission)

    if (rank?.permissions.includes("all")) return true;

    return rank ? rank.permissions.includes(permission) : false;
}

export function hasAnyPermission(rankId: number, permissions: Permission[], ranks: Rank[]): boolean {
    return permissions.some((permission) => hasPermission(rankId, permission, ranks))
}

export function hasAllPermissions(rankId: number, permissions: Permission[], ranks: Rank[]): boolean {
    return permissions.every((permission) => hasPermission(rankId, permission, ranks))
}

export function getRankPermissions(rankId: number, ranks: Rank[]): Permission[] {
    const rank = ranks.find(r => r.id == rankId);
    return rank ? rank.permissions : [];
}

export const selectPermission = (state: RootState) => state.ranks.permissions

export const PAGE_PERMISSIONS: Record<string, Permission | null> = {
    ranks: "manageRanks",
    members: "manageMembers",
    news: "manageNews",
};