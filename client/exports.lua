local cachedFactions         = nil
local lastUpdate             = 0
local CACHE_INTERVAL <const> = 10000

local factionTypes           = {}
local playerFactions         = {}
local playerFactionsKey      = {}


RegisterNetEvent("mate-factions:updateClientFactionTypes", function(data, factions)
    factionTypes = data
    playerFactions = factions
    playerFactionsKey = {}

    for facId, faction in pairs(factions or {}) do
        playerFactionsKey[faction.id] = faction
    end


    sendNUI("updateClientFactionTypes", {
        factions = factions
    })

    if #factions <= 0 then
        sendNUI("close")
        SetNuiFocus(false, false)
    end
end)


function GetPlayerFactionTypes()
    local currentDuty = LocalPlayer.state.factionDuty
    local result = {}

    for typ, state in pairs(factionTypes) do
        local typeData = GetFactionTypeByName(typ)
        if typeData?.settings?.allowDuty then
            result[typ] = type(currentDuty) == 'table' and currentDuty?.factionType?.name == typ
        else
            result[typ] = state
        end
    end

    return result
end

exports('GetPlayerFactionTypes', GetPlayerFactionTypes)

function GetPlayerFactions()
    return playerFactions or {};
end

exports('GetPlayerFactions', GetPlayerFactions);

function GetPlayerFactionsAsKey()
    return playerFactionsKey or {};
end

exports('GetPlayerFactionsAsKey', GetPlayerFactionsAsKey);

function CanUseFactionGarage(factionID, isGarage)
    local factions = GetPlayerFactions()
    local currentDuty = LocalPlayer.state.factionDuty
    for i = 1, #factions do
        if isGarage then
            if factions[i]?.settings?.allowDuty then
                if type(currentDuty) == 'table' then
                    return true
                end
            elseif factions[i].id == factionID then
                return true
            end
        elseif factions[i].id == factionID then
            return true
        end
    end
end

exports('CanUseFactionGarage', CanUseFactionGarage);


function getFactionRanks()
    local faction = lib.callback.await("mate-faction:GetPlayerFaction", false)

    if not faction or not faction.factionData or not faction.factionData.ranks then
        print("[^4getFactionRanks^7][^3Warning^7] - No faction data found for player.")
        return {}
    end


    print(json.encode(faction, { indent = true }))

    local ranks = {}

    for id, data in pairs(faction.factionData.ranks) do
        local perms = {}

        for key, _ in pairs(data.permissions) do
            table.insert(perms, key)
        end

        table.insert(ranks, {
            id = id,
            name = data.name,
            permissions = perms,
            color = data.color,
            description = data.description
        })
    end

    return ranks
end

exports("GetFactionRanks", getFactionRanks)
