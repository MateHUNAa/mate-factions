lib.callback.register("mate-factions:getDutyData", (function(source)
    local Player = mCore.getPlayer(source)

    local res = {}

    if not Player then
        res.err = true
        res.msg = "Failed to initialize player !"
        Logger:Debug("[getDutyData]: Failed to initialize Player")
        return res
    end

    local factionId, factionData, memberData = GetEffectiveFaction(Player.identifier)
    -- Logger:Debug(factionId, json.encode(factionData, { indent = true }), "\n", json.encode(memberData, { indent = true }))

    if not factionId or not factionData or not memberData then
        res.err = true
        res.msg = "Failed to fetch Faction Data !"
        Logger:Debug("[getDutyData]: Failed to fetch Faction Data")
        return res
    end

    res = {
        factionType = factionData.type,
        factionName = factionId,
        rankLabel = Factions[factionId].ranks[tostring(memberData.rank)].name
    }

    return res
end))




lib.callback.register("mate-factions:requestClientFactions", (function(source)
    local Player = mCore.getPlayer(source)
    if not Player then return end

    local playerFactions = {}

    for factionId, factionData in pairs(Factions) do
        local member = factionData.members[Player.identifier]
        if member then
            playerFactions[factionId] = factionData
        end
    end

    return playerFactions
end))
