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
        playerFactionsKey[facId] = faction
    end


    sendNUI("updateClientFactionTypes", {
        factions = factions
    })

    if #factions <= 0 then
        -- TODO: Hide panel cuz player is no part of any faction
        print("(TODO)Player no part of any faction! Hiding panels ! (TODO)")
    end
end)

local function UpdateFactionCache()
    local now = GetGameTimer()
    if not cachedFactions or (now - lastUpdate) > CACHE_INTERVAL then
        cachedFactions = lib.callback.await("mate-faction:RequestFactions", false)
        lastUpdate = now
    end
    return cachedFactions
end

-- FIXME: Markers does not update after a new faction is set for a player, 
local function UpdatePlayerFactionCache()
    local now = GetGameTimer()
    if not playerFactions or (now - lastUpdate) > CACHE_INTERVAL then
        playerFactions = lib.callback.await("mate-factions:requestClientFactions", false)
        lastUpdate = now
    end
    return playerFactions
end

function CanUseFactionGarage(factionId, isGarage)
    local factions = UpdatePlayerFactionCache()
    local currentDuty = LocalPlayer.state.factionDuty

    for facId, factionData in pairs(factions) do
        if isGarage then
            if factionData?.settings?.duty then
                if type(currentDuty) == "table" then
                    return true
                end
            else
                if facId == factionId then
                    return true
                end
            end
        else
            if facId == factionId then
                return true
            end
        end
    end
    return false
end

exports("CanUseFactionGarage", CanUseFactionGarage)
