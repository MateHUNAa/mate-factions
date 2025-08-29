import { PanelType } from "@/App";
import { useFaction } from "@/hooks/useFaction";
import { useRanks } from "@/hooks/useRanks";
import { hasPermission } from "@/lib/permission";
import { useUser } from "@/store/userSlice";
import React from "react";
import { navigation } from "./Navbar";

interface Props {
    page: PanelType;
    children: React.ReactNode;
    setPage: (page: PanelType) => void;
}

const FactionPage: React.FC<Props> = ({ page, children, setPage }) => {

    const user = useUser()
    const ranks = useRanks()
    const { selectedFaction } = useFaction()

    const navItem = navigation.find((n) => n.href == page)
    const requiredPermission = navItem?.permission

    const rankId = user?.factions.find((f) => f.id == selectedFaction?.id)?.rank?.id

    if (requiredPermission && rankId && !hasPermission(rankId, requiredPermission, ranks)) {
        setPage("Dashboard")
        return null
    }

    return (
        <>{children}</>
    );
};

export default FactionPage;