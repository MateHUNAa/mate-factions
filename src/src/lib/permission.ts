import { RootState } from "@/store"
import { useSelector } from "react-redux";

export type Permission = string;

export interface Rank {
    id: number;
    name: string;
    color: string;
    permissions: Permission[],
    description: string;
}

export function hasPermission(userRank: string, permission: Permission, ranks: Rank[]): boolean {
    const rank = ranks.find(r => r.name.toLowerCase() === userRank.toLowerCase());
    return rank ? rank.permissions.includes(permission) : false;
}

export function hasAnyPermission(userRank: string, permissions: Permission[], ranks: Rank[]): boolean {
    return permissions.some((permission) => hasPermission(userRank, permission, ranks))
}

export function hasAllPermissions(userRank: string, permissions: Permission[], ranks: Rank[]): boolean {
    return permissions.every((permission) => hasPermission(userRank, permission, ranks))
}

export function getRankPermissions(userRank: string, ranks: Rank[]): Permission[] {
    const rank = ranks.find(r => r.name.toLowerCase() === userRank.toLowerCase());
    return rank ? rank.permissions : [];
}

export const selectRanks = (state: RootState) => state.ranks.ranks
export const selectPermission = (state: RootState) => state.ranks.permissions

export const PAGE_PERMISSIONS: Record<string, Permission | null> = {
    ranks: "manageRanks",
    members: "manageMembers",
    news: "manageNews",
};


export function useRanks() {
    return useSelector(selectRanks);
}