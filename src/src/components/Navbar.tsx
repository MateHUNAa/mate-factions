"use client"
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, Home, Newspaper, Settings, Shield, Users } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { PanelType } from "@/App";
import { hasPermission, useRanks } from "@/lib/permission";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

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


const Navbar: React.FC<Props> = ({ activePage, onPageChange }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false)
    const ranks = useRanks()
    const user = useSelector((state: RootState) => state.user.currentUser)


    return (
        <div
            className={cn(
                "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 mr-2",
                collapsed ? "w-16" : "w-64",
            )}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                {!collapsed && <h1 className="font-heading text-xl font-bold text-white">mFaction</h1>}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-white hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </Button>
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-4 text-white">
                <nav className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = item.href === activePage

                        // const shouldShow = !item.permission || hasPermission()

                        // if (!shouldShow) return null

                        return (
                            <Button
                                variant={isActive ? "default" : "ghost"}
                                onClick={() => onPageChange(item.href)}
                                className={cn(
                                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
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
        </div>
    );
};

export default Navbar;