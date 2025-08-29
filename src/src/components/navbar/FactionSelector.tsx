import React, { useState } from "react"
import { Check, ChevronDown, Sword } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useFaction } from "@/hooks/useFaction"
import { useUser } from "@/store/userSlice"

interface FactionSelectorProps {
    collapsed?: boolean
}

const FactionSelector: React.FC<FactionSelectorProps> = ({ collapsed = false }) => {
    const { playerFactions, selectedFaction, selectFaction } = useFaction()

    const [isOpen, setIsOpen] = useState(false)
    const user = useUser()

    if (!user || !selectedFaction) {
        return null
    }

    console.log(selectedFaction)

    if (collapsed) {
        return (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`size-10 rounded-lg border-2 border-[#FFA500] hover:border-amber-400 group`}
                    >
                        <Sword className=" text-[#FFA500] group-hover:text-amber-600" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-zinc-800/90">
                    <div className="px-2 py-1.5 text-sm font-medium text-white">Switch Faction</div>
                    {playerFactions.map((faction) => (
                        <DropdownMenuItem
                            key={faction.id}
                            onClick={() => selectFaction(faction.id)}
                            className="flex items-center gap-3 px-2 py-2 text-white focus:text-gray-400 group transition-colors"
                        >
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFA500"/*faction.color*/ }} />
                            <div className="flex-1 min-w-0">
                                <div className="font-medium">{faction.name}</div>
                                <div className="text-xs text-gray-400 group-focus:text-gray-500">{faction?.members?.length?.toString() || 0} members</div>
                            </div>
                            {selectedFaction.id === faction.id && <Check className={`size-8 text-white`} />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-between h-auto p-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700">
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFA500"/*faction.color*/ }} />
                        <div className="text-left min-w-0 flex-1">
                            <div className="font-medium text-gray-300 truncate">{selectedFaction.name}</div>
                            <div className="text-xs text-white truncate">
                                {selectedFaction?.members?.length?.toString() || 0} members
                            </div>
                        </div>
                    </div>
                    <ChevronDown className="size-4 text-white flex-shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-64 bg-zinc-800/90">
                <div className="px-2 py-1.5 text-sm font-medium text-white">Switch Faction</div>
                {playerFactions.map((faction) => (
                    <DropdownMenuItem
                        key={faction.id}
                        onClick={() => selectFaction(faction.id)}
                        className="flex items-center gap-3 px-2 py-2 text-white focus:text-gray-400 group transition-colors"
                    >
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#FFA500"/*faction.color*/ }} />
                        <div className="flex-1 min-w-0">
                            <div className="font-medium">{faction.name}</div>
                            <div className="text-xs text-gray-400 group-focus:text-gray-500">{faction?.memberCount?.toString() || 0} members</div>
                        </div>
                        {selectedFaction.id === faction.id && <Check className={`size-8 text-white`} />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}


export default FactionSelector