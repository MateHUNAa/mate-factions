local cachedFactions = nil
local lastUpdate = 0
local CACHE_INTERVAL <const> = 10000

local function UpdateFactionCache()
    local now = GetGameTimer()
    if not cachedFactions or (now - lastUpdate) > CACHE_INTERVAL then
        cachedFactions = lib.callback.await("mate-faction:RequestFactions", false)
        lastUpdate = now
    end
    return cachedFactions
end

function CanUseFactionGarage(factionId, isGarage)
    local factions = UpdateFactionCache()
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
  
end

exports("CanUseFactionGarage", CanUseFactionGarage)
