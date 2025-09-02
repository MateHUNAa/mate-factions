ESX = exports['es_extended']:getSharedObject()
mCore = exports["mCore"]:getSharedObj()
ox_inventory = exports.ox_inventory
Logger = require("shared.Logger")
lang = Loc[Config.lan]
isLoaded = false


---@class FactionRank
---@field name string
---@field permissions table<string, boolean>
---@field color string
---@field description string
---@field id? string

---@class Faction
---@field name string (FactionId)
---@field id string (FactionId)
---@field label string
---@field type FactionType
---@field ranks FactionRank[]
---@field permissions table<FactionAbilities, boolean>
---@field settings table<string, any>
---@field allow_offduty boolean
---@field duty_point vector3|nil
---@field stash vector3|nil
---@field members FactionMember[]
---@field posts FactionPost[]

---@class FactionMember
---@field rank number
---@field title? string
---@field on_duty boolean
---@field joined_at Date
---@field badge FactionBadge|nil


---@type Faction[]
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

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    TriggerClientEvent("mate-factions:AddAllDutyMarker", playerId, Factions)
end)
