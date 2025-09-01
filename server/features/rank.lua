local Logger = require("shared.Logger")
local MemberUpdate = require("server.helpers.FactionMemberUpdater")
local RankUpdate = require("server.helpers.FactionRankUpdater")

function AddRank(factionId, rankId, name, permissions, description, color)
    local faction = Factions[factionId]
    if not faction then return false end

    local normalizedPermissions = {}
    if type(permissions) == "table" then
        local isArray = (#permissions > 0)
        if isArray then
            for _, perm in pairs(permissions) do
                normalizedPermissions[perm] = true
            end
        else
            normalizedPermissions = permissions
        end
    end



    faction.ranks[tostring(rankId)] = {
        name = name,
        permissions = normalizedPermissions or {},
        description = description or "Description is not set.",
        color = color or "#ff0000"
    }

    MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
        json.encode(faction.ranks),
        factionId
    })
end

exports("AddRank", AddRank)

function RemoveRank(factionId, rankId)
    local faction = Factions[factionId]
    if not faction then return false end

    faction.ranks[tostring(rankId)] = nil

    MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
        json.encode(faction.ranks),
        factionId
    })

    for idf, member in pairs(faction.members) do
        if tonumber(member.rank) == tonumber(rankId) then
            local newRankId, newRank = GetValidRank(member.rank, faction.ranks)
            if newRankId then
                member.rank = newRankId

                Logger:Debug(("[RemoveRank]: (%s): old RankId was: %s, New RankId : %s"):format(idf, rankId, newRankId))

                MySQL.update.await("UPDATE faction_members SET rank = ? WHERE identifier = ? AND faction_name = ?",
                    { newRankId, idf, factionId })
            else
                Logger:Error(("[^4RemoveRank^0]: Corrupted faction ! No ranks found in `%s`"):format(factionId))
            end
        end
    end

    return true
end

exports("RemoveRank", RemoveRank)

--- Finds the closest valid rank for a given priority
---@param targetPrio number
---@param ranks table
function GetValidRank(targetPrio, ranks)
    local prio = tonumber(targetPrio)
    if not prio then return nil, nil end

    local rank = ranks[tostring(prio)]
    if rank then
        return prio, rank
    end

    local priorities = {}
    for prioStr, _ in pairs(ranks) do
        table.insert(priorities, tonumber(prioStr))
    end

    if #priorities == 0 then
        return nil, nil -- No ranks exists at all
    end

    table.sort(priorities, function(a, b)
        return a < b
    end)

    local closest = nil
    for _, p in ipairs(priorities) do
        if p <= prio then
            closest = p
        else
            break
        end
    end

    if not closest then
        closest = priorities[1]
    end

    return closest, ranks[tostring(closest)]
end

exports("GetValidRank", GetValidRank)

---@param currentPrio string
---@param ranks any
---@param direction "up"  | "down"
function GetAdjacentRank(currentPrio, ranks, direction)
    local prio = tonumber(currentPrio)
    if not prio then return nil, nil end

    -- Collect all priorities
    local priorities = {}
    for prioStr, _ in pairs(ranks) do
        local n = tonumber(prioStr)
        if n then table.insert(priorities, n) end
    end

    if #priorities == 0 then return nil, nil end

    -- Sort priorities
    if direction == "up" then
        table.sort(priorities) -- ascending
        for _, p in ipairs(priorities) do
            if p > prio then
                return p, ranks[tostring(p)]
            end
        end
    elseif direction == "down" then
        table.sort(priorities, function(a, b) return a > b end)
        for _, p in ipairs(priorities) do
            if p < prio then
                return p, ranks[tostring(p)]
            end
        end
    else
        return nil, nil
    end

    return nil, nil
end

---@param params { level: number, name: string, permissions: table, description: string, color: string, factionId: string }
regServerNuiCallback("createRank", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = "Faction not found.", msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = "Your membership not found in this faction.", msgType = "error", error = true }
    end

    if not MemberHasPermission(idf, params.factionId, "manageRanks") then
        return { msg = "You don't have permission to manage ranks.", msgType = "error", error = true }
    end

    if not params.name or params.name == "" then
        return { msg = "Rank name is required.", msgType = "error", error = true }
    end

    if not params.level then
        return { msg = "Rank level is required.", msgType = "error", error = true }
    end

    AddRank(params.factionId, params.level, params.name, params.permissions, params.description, params.color)

    Logger:Info(("Rank `%s(%s)` created in faction `%s` by `%s`"):format(
        params.name,
        params.level,
        params.factionId,
        idf
    ))

    return { msg = ("Created new rank `%s`."):format(params.name), msgType = "success", error = false }
end)

---@param params { rank: table, factionId: string }
regServerNuiCallback("removeRank", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = "Faction not found.", msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = "Your membership not found in this faction.", msgType = "error", error = true }
    end

    if not MemberHasPermission(idf, params.factionId, "manageRanks") then
        return { msg = "You don't have permission to manage ranks.", msgType = "error", error = true }
    end

    if not params.rank or not params.rank.id then
        return { msg = "Invalid rank data.", msgType = "error", error = true }
    end

    local rankId, rankName = params.rank.id, params.rank.name or "Unknown"

    if not faction.ranks[tostring(rankId)] then
        return { msg = "Rank not found in faction.", msgType = "error", error = true }
    end

    RemoveRank(params.factionId, rankId)

    Logger:Info(("Rank `%s(%s)` removed from faction `%s` by `%s`"):format(
        rankName,
        rankId,
        params.factionId,
        idf
    ))

    return { msg = ("Removed rank %s from faction."):format(rankName), msgType = "success", error = false }
end)


regServerNuiCallback("updateFactionRank", function(pid, idf, params)
    local Player = mCore.getPlayer(pid)
    if not Player then return end

    local faction = Factions[params.factionId]
    if not faction then return { msg = "Failed to get faction with factionID: " .. params.factionId, error = true } end

    local member = faction?.members[idf]
    if not member then
        return {
            msg = ("Failed to get faction: `%s` member: `%s`"):format(params.factionId, idf),
            msgType =
            "error"
        }
    end

    if not MemberHasPermission(idf, params.factionId, "manageRanks") then
        return { msg = (lang.error["permission_missing"]):format("manageRanks"), msgType = "error", error = false }
    end

    local oldRankKey = tostring(params.old.id)
    local rank = faction.ranks[oldRankKey]
    if not rank then
        return { msg = lang.error["rank_missing"], msgType = "error" }
    end


    local newPerms = params.new.permissions or {}
    if type(newPerms) == "table" and (#newPerms > 0) then
        local normalized = {}
        for _, perm in ipairs(newPerms) do
            normalized[perm] = true
        end
        newPerms = normalized
    end

    local updater = RankUpdate.new(params.factionId, oldRankKey)


    updater
        :WithName(params.new.name)
        :WithDescription(params.new.description)
        :WithColor(params.new.color)
        :WithPermissions(newPerms)


    local errVal, updatedRank = updater:Apply(true)
    if errVal ~= "success" then
        -- TODO: HandleError
        return { msg = lang.error[errVal] or "Unknown error", msgType = "error", error = true }
    end

    if oldRankKey ~= tostring(params.new.level) then
        faction.ranks[tostring(params.new.level)] = updatedRank
        faction.ranks[tostring(oldRankKey)]       = nil

        for idf, member in pairs(faction.members) do
            if tostring(member.rank) == oldRankKey then
                member.rank = params.new.level
                MySQL.update.await("UPDATE faction_members SET rank = ? WHERE identifier = ? AND faction_name = ?", {
                    params.new.level, idf, params.factionId
                })
            end
        end

        MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
            json.encode(faction.ranks),
            params.factionId
        })
    end

    return { success = true, msg = (lang.success["rank_updated"]):format(params.new.name), msgType = "success" }
end)


function SetPlayerRank(identifier, factionId, newRank)
    local function handleErr(errVal, src)
        if errVal == "faction_missing" then
            mCore.Notify(src, lang.Title, string.format(lang.error["faction_missing"], factionId), "error", 5000)
        elseif errVal == "player_missing" then
            mCore.Notify(src, lang.Title, lang.error["player_missing"], "error", 5000)
        elseif errVal == "rank_missing" then
            mCore.Notify(src, lang.Title, lang.error["rank_missing"], "error", 5000)
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, lang.error["db_err"], "error", 5000)
        elseif errVal == "sync_err" then
            mCore.Notify(src, lang.Title, lang.error["sync_err"], "error", 5000)
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"], "error", 5000)
        end
    end

    local faction = Factions[factionId]
    if not faction then
        return false, "faction_missing", handleErr
    end

    local success, errVal, member =
        MemberUpdate.new(identifier, factionId)
        :WithRank(newRank)
        :Apply(true)

    if not success then
        handleErr(errVal)
    end

    return success and success or false, member
end

exports("SetPlayerRank", SetPlayerRank)


function GetFactionMemeberRank(identifier, factionId)
    local member = Factions[factionId] and Factions[factionId].members[identifier]
    if not member then return nil end
    local rankId = tonumber(member.rank)
    return Factions[factionId].ranks[rankId]
end

exports("GetFactionMemeberRank", GetFactionMemeberRank)

function IsLeader(identifier, factionId)
    local member = Factions[factionId] and Factions[factionId].members[identifier]
    if not member then return false, false end
    local rankId = member.rank

    return rankId == 100, rankId == 99
end

exports("IsLeader", IsLeader)


regServerNuiCallback("requestFactionRanks", function(pid, idf, factionId)
    if not factionId then return { msg = "No factionId provided !", msgType = "error", error = true } end

    local faction = Factions[factionId]
    if not faction then return { msg = ("No faction found with faction id: `%s`"):format(factionId), msgType = "error" } end

    local ranks = {}

    for id, rank in pairs(faction.ranks) do
        local perms = {}
        for key, enabled in pairs(rank.permissions) do
            if enabled then
                table.insert(perms, key)
            end
        end

        table.insert(ranks, {
            id = id,
            name = rank.name,
            permissions = perms,
            color = rank.color,
            description = rank.description
        })
    end

    return {
        data = ranks
    }
end)
