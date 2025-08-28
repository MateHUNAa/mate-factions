function MemberHasPermission(identifier, factionId, permission)
    local faction = Factions[factionId]
    if not faction then return false end

    local member = faction.members[identifier]
    if not member then return false end

    local rankData = faction.ranks[tostring(member.rank)]
    if not rankData then return false end


    print("[MemberHasPermission]: rankData", json.encode(rankData, { indent = true }))
    if rankData.permissions and rankData.permissions["all"] then
        return true
    end


    if rankData.permissions and rankData.permissions[permission] then
        return true
    end

    return false
end

exports("MemberHasPermission", MemberHasPermission)
