---@param params { factionId: string}
regServerNuiCallback("requsetNearbyPlayers", function(pid, idf, params)
    local mypos = GetEntityCoords(GetPlayerPed(pid))
    local nearbyPlayers = lib.getNearbyPlayers(mypos, 80.0)

    local players = {}

    local faction, _ = GetEffectiveFaction(params.factionId, idf)

    for _, data in pairs(nearbyPlayers) do
        local Player = mCore.getPlayer(data.id)
        if not Player then goto continue end

        local entry = {
            id         = data.id,
            identifier = Player.identifier,
            distance   = #(mypos - data.coords),
            avatar     = Player.discord.img,
            name       = Player.Name -- TODO: Use RPName
        }
        table.insert(players, entry)
        ::continue::
    end

    if #players <= 0 then
        return { msg = "No nearby players found !", msgType = "error", error = true }
    end

    return { data = players }
end)


---@param params {target: string, factionId: string}
regServerNuiCallback("inviteMember", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = (lang.error["faction_missing"]):format(params.factionId), msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = lang.error["not_member"], msgType = "error", error = true }
    end

    local Player = mCore.getPlayer(idf)
    if not Player then return end

    if not MemberHasPermission(idf, params.factionId, "kickMembers") then
        return { msg = (lang.error["permission_missing"]):format("kickMembers"), msgType = "error", error = true }
    end

    local targetMember = faction.members[params.target]
    if targetMember then
        return { msg = lang.error["same_faction"], msgType = "error", error = true }
    end

    local playerId = GetPlayerServerIdByIdentifier(params.target)
    if not playerId then
        return { msg = "No playerId", error = true }
    end

    local accepted = lib.callback.await('mate-faction:inviteRequest', playerId, {
        label     = faction.label,
        factionId = params.factionId,
        from      = {
            id = pid,
            idf = idf,
            name = Player.Name -- TODO: RPName
        }
    })

    if accepted then
        SetPlayerFaction(params.target, params.factionId)
    end

    return { msg = 'suc' }
end)
