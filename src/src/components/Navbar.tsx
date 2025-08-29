"use client"
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Home, Shield, Users } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { PanelType } from "@/App";
import { useRanks } from "@/hooks/useRanks";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, useUser } from "@/store/userSlice";
import { useFaction } from "@/hooks/useFaction";
import FactionSelector from "./navbar/FactionSelector";
import { hasPermission } from "@/lib/permission";
import { Faction } from "@/store/factionSlice";
interface Props {
    activePage: PanelType,
    onPageChange: (page: PanelType) => void;
}

export interface NavigationItem {
    name: string;
    href: PanelType;
    icon: any;
    permission?: string;
}

export const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "Dashboard", icon: Home },
    { name: "Ranks", href: "Ranks", icon: Shield, permission: "manageRanks" },
    { name: "Members", href: "Members", icon: Users, permission: "manageMembers" },
];

export const getUserRankId = (user: User, selectedFaction?: Faction) => {
    const rankId = user.factions.find(f => f.id === selectedFaction?.id)?.rank?.id;

    return rankId || 1
}


const Navbar: React.FC<Props> = ({ activePage, onPageChange }) => {
    const [collapsed, setCollapsed] = useState<boolean>(true)
    const ranks = useRanks()
    const user = useUser()

    const { playerFactions, selectedFaction, selectFaction } = useFaction()

    if (!user) {
        console.error("localUser is not found!")
        return null
    }

    return (
        <div
            className={cn(
                "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 mr-2",
                collapsed ? "w-16" : "w-64",
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                {!collapsed && <h1 className="font-heading text-xl font-bold text-white">{selectedFaction?.label || "mFaction"}</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Faction Selector */}
            <div className="px-3 py-4 border-b border-white">
                <FactionSelector collapsed={collapsed} />
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4 text-white">
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = item.href === activePage

                        const rankId = getUserRankId(user, selectedFaction || playerFactions[0])
                        if (!rankId) return null
                        const shouldShow = !item.permission || hasPermission(rankId, item.permission, ranks);
                        if (!shouldShow) return null

                        return (
                            <Button
                                key={item.href}
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => onPageChange(item.href)}
                                className={cn(
                                    "w-full justify-start gap-3 text-white hover:bg-sidebar-accent hover:text-gray-400",
                                    isActive && "bg-sidebar-accent text-gray-400",
                                    collapsed && "justify-center px-2",
                                )}
                            >
                                <item.icon className="h-5 w-5 flex-shrink-0" />
                                {!collapsed && <span>{item.name}</span>}
                            </Button>
                        )
                    })}
                </nav>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-4">
                <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
                    <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                        <Avatar>
                            <AvatarFallback>{user?.discordName?.charAt(0) || "U"}</AvatarFallback>
                            <AvatarImage src={user?.imageUrl} />
                        </Avatar>
                    </div>
                    {!collapsed && user && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.discordName || "NAME_NOT_FOUND"}</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Navbar;