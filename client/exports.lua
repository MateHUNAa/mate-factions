function CanUseFactionGarage(factionId, isGarage)
    local factions = lib.callback.await("mate-faction:RequestFactions", false)
    local currentDuty = LocalPlayer.state.factionDuty

    for i = 1, #factions do
        print(json.encode(factions[i], { indent = true }))
        print("\n\n\n")
        if isGarage then
            if factions[i]?.settings?.duty then
                if type(currentDuty) == "table" then
                    return true
                end
            else
                if factions[i].id == tonumber(factionId) then
                    return true
                end
            end
        else
            if factions[i].id == tonumber(factionId) then
                return true
            end
        end
    end
end

exports("CanUseFactionGarage", CanUseFactionGarage)
