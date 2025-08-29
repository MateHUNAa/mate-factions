---@alias FactionPostCategory "update"|"event"|"notice"|"guide"|"announcement"
---@alias FactionPostPriority "high"|"medium"|"low"

---@class FactionPost
---@field creator string identifier
---@field createdAt Date Createion DateTime
---@field content string
---@field title string
---@field category FactionPostCategory
---@field priority FactionPostPriority

---@param params {factionId: string, title:string, content:string, category: FactionPostCategory, priority: FactionPostPriority}
regServerNuiCallback("postFactionPost", (function(pid, idf, params)
    local faction, member, handleNotify = GetEffectiveFaction(params.factionId, idf)
    if not handleNotify(pid, member) then return end


    if not MemberHasPermission(idf, faction.id, "createPost") then
        return handleNotify(pid, "permission_missing",
            "createPost")
    end

    ---@type FactionPost
    local entry = params
    entry.creator = idf

    table.insert(faction.posts, entry)

    MySQL.update.await("UPDATE factions SET posts = ? WHERE name = ?", {
        json.encode(faction.posts),
        faction.id
    })

    return { error = false }
end))


regServerNuiCallback("requestNews", function(pid, idf, params)
    local faction, member, handleNotify = GetEffectiveFaction(params.factionId, idf)
    if not handleNotify(pid, member) then return end

    return { data = faction.posts, error = false }
end)
