lib.callback.register("mate-factions:getDutyData", (function(source)
    local Player = mCore.getPlayer(source)

    local res = {}

    if not Player then
        res.err = true
        res.msg = "Failed to initialize player !"
        return res
    end

    local factionId, factionData, memberData = GetEffectiveFaction(Player.identifier)

    if not factionId or not factionData or not memberData then
        res.err = true
        res.msg = "Failed to fetch Faction Data !"
        return res
    end

    res = {
        factionType = factionData.type,
        factionName = factionId,
        rankLabel = memberData.rank
    }

    return res
end))
