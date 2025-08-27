import { easingDefinitionToFunction } from "framer-motion"

export const PERMISSIONS = {
    MANAGE_RANKS: "manageRanks",
    MANAGE_MEMBERS: "manageMembers",
    MANAGE_NEWS: "manageNews",
    KICK_MEMBERS: "kickMembers",
    STASH_ACCESS: "stashAccess"
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
export type RankName = (typeof RANKS)[keyof typeof RANKS]["name"]

export const RANKS = {
    LEADER: {
        id: 100,
        name: "leader",
        color: "#ff0000",
        permissions: [
            PERMISSIONS.MANAGE_RANKS,
            PERMISSIONS.MANAGE_MEMBERS,
            PERMISSIONS.MANAGE_NEWS,
            PERMISSIONS.KICK_MEMBERS,
        ],
    },
    SUB_LEADER: {
        id: 99,
        name: "sub-leader",
        color: "#ff0000",
        permissions: [
            PERMISSIONS.MANAGE_RANKS,
            PERMISSIONS.MANAGE_MEMBERS,
            PERMISSIONS.MANAGE_NEWS,
            PERMISSIONS.KICK_MEMBERS,
        ],
    },
    MEMBER: {
        id: 2,
        name: "member",
        color: "#6c5ce7",
        permissions: [
            PERMISSIONS.STASH_ACCESS
        ],
    },
    NEWCOMER: {
        id: 1,
        name: "newcomer",
        color: "#a4b0be",
        permissions: [],
    },
}

export type rankId = keyof typeof RANKS

// const RANKS_BY_NAME = new Map<string, typeof RANKS.LEADER>(
//     Object.values(RANKS).map((r) => [r.name.toLowerCase(), r])
// );

export function hasPermission(userRank: RankName, permission: Permission): boolean {
    const rank = Object.values(RANKS).find((r) => r.name === userRank.toLowerCase())
    return rank ? rank.permissions.includes(permission) : false
}

export function hasAnyPermission(userRank: RankName, permissions: Permission[]): boolean {
    return permissions.some((permission) => hasPermission(userRank, permission))
}

export function hasAllPermissions(userRank: RankName, permissions: Permission[]): boolean {
    return permissions.every((permission) => hasPermission(userRank, permission))
}

export function getRankPermissions(userRank: RankName): Permission[] {
    const rank = Object.values(RANKS).find((r) => r.name === userRank.toLowerCase())
    return rank ? rank.permissions : []
}


export function canAccessPage(userRank: string, page: string): boolean {
    switch (page) {
        case "ranks":
            return hasPermission(userRank, PERMISSIONS.MANAGE_RANKS)
        case "members":
            return hasPermission(userRank, PERMISSIONS.MANAGE_MEMBERS)
        case "news":
            return hasPermission(userRank, PERMISSIONS.MANAGE_NEWS)
        default:
            return true
    }
}
