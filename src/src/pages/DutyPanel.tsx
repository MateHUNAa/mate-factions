import { PanelType } from "@/App";
import { Button } from "@/components/ui/button";
import { fetchNui } from "@/utils/fetchNui";
import React, { useState } from "react"

interface DutyPanelProps {
    visible: boolean;
    factionName?: string;
    rankLabel?: string;
    onDuty: boolean;
}

export interface DutyData {
    duty: boolean;
    page: PanelType;
    visible: boolean;
    onDuty: boolean;
    factionType?: string;
    factionName?: string;
    rankLabel?: string;
}

const DutyPanel: React.FC<DutyPanelProps> = ({
    visible,
    factionName,
    rankLabel,
    onDuty,
}) => {
    const [hoverAudio] = useState(() => new Audio("/sounds/hover.mp3"))
    const [clickAudio] = useState(() => new Audio("/sounds/click.mp3"))

    const playSound = (type: "hover" | "click", volume: number) => {
        let audio: HTMLAudioElement

        switch (type) {
            case "hover":
                audio = hoverAudio
                break;
            case "click":
                audio = clickAudio
                break;
        }

        audio.volume = volume
        audio.currentTime = 0
        audio.play().catch((err) => console.error("Audio play failed", err))
    }

    const ToggleDuty = () => {
        fetchNui("ToggleDuty")
    }

    if (!visible) return null


    return (
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/5 text-white bg-zinc-800 border-2 border-zinc-600 rounded-md">
            <div className="header text-center font-bold py-2">
                mate-factions
            </div>
            <div className="duty-content flex flex-col items-center justify-center gap-6 p-2">
                <p>Frakció: {factionName || "Ismeretlen"}</p>
                <p>Rangod: {rankLabel || "Ismeretlen"}</p>
                <div className="flex items-center justify-center gap-3 w-full">
                    <Button
                        onMouseOver={() => playSound("hover", 0.1)}
                        onClick={ToggleDuty}
                        className={`w-full font-bold text-[1.6vh] py-1 px-2 rounded ${onDuty ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {onDuty ? "Kilépés a szolgálatból" : "Szolgálatba lépés"}
                    </Button>

                    <Button
                        onMouseOver={() => playSound("hover", 0.1)}
                        className={`w-full font-bold text-[1.6vh] py-1 px-2 rounded bg-green-600/80 hover:bg-green-700/80`}
                        onClick={() => fetchNui("makeBadge", factionName)}
                    >
                        Make Badge
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DutyPanel;