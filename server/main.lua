ESX = exports['es_extended']:getSharedObject()
mCore = exports["mCore"]:getSharedObj()
local inv = exports["ox_inventory"]

isLoaded = false


---@alias FactionType "job" | "gang" | "organization" | "maffia"

---@class FactionRanks
---@param name string
---@param permissions table

---@class Faction
---@param name string (FactionId)
---@param label string
---@param type FactionType
---@param ranks FactionRanks[]
---@param permissions table
---@param allow_offduty boolean
---@param duty_point vector4
---@param mebmers FactionMember[]

---@class FactionMember
---@param rank { name: string, permissions: table}
---@param title string
---@param on_duty boolean
---@param joined_at Date


Factions = {}

Citizen.CreateThread(function()
    Init()
end)

lib.callback.register("mate-faction:RequestFactions", (function(src)
    return Factions
end))

lib.callback.register("mate-faction:GetPlayerFaction", (function(src)
    local Player = mCore.getPlayer(src)
    if not Player then return end

    local idf = Player.identifier


    for factionId, factionData in pairs(Factions) do
        if factionData.members then
            for memberIdentifier, memberData in pairs(factionData.members) do
                if memberIdentifier == idf then
                    return {
                        factionId = factionId,
                        factionData = factionData,
                        memberData = memberData
                    }
                end
            end
        end
    end
    
    return nil
end))
