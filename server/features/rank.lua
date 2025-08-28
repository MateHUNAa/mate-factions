local Logger = require("shared.Logger")

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

regServerNuiCallback("createRank", function(pid, idf, params)
    local Player = mCore.getPlayer(pid)
    if not Player then return end

    local factionId, factionData, memberData = GetPlayerFaction(Player.identifier)

    if not factionId then return { data = nil, msg = "This player is not part of a factionId !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not memberData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    if not MemberHasPermission(idf, factionId, "manageRanks") then
        return { msg = (lang.error["permission_missing"]):format("manageRanks"), msgType = "error", error = false }
    end

    AddRank(factionId, params.level, params.name, params.permissions, params.description, params.color)

    return { msg = (lang.success["rank_created"]):format(params.name), msgType = "success" }
end)
regServerNuiCallback("removeRank", function(pid, idf, params)
    local Player = mCore.getPlayer(pid)
    if not Player then return end

    local factionId, factionData, memberData = GetPlayerFaction(Player.identifier)

    if not factionId then return { data = nil, msg = "This player is not part of a factionId !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not memberData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    if not MemberHasPermission(idf, factionId, "manageRanks") then
        return { msg = (lang.error["permission_missing"]):format("manageRanks"), msgType = "error", error = false }
    end

    RemoveRank(factionId, params.id)

    return { msg = (lang.success["rank_deleted"]):format(params.name), msgType = "success" }
end)
regServerNuiCallback("updateFactionRank", function(pid, idf, params)
    local Player = mCore.getPlayer(pid)
    if not Player then return end

    local factionId, factionData, memberData = GetPlayerFaction(Player.identifier)

    if not factionId then return { data = nil, msg = "This player is not part of a factionId !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not memberData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    if not MemberHasPermission(idf, factionId, "manageRanks") then
        return { msg = (lang.error["permission_missing"]):format("manageRanks"), msgType = "error", error = false }
    end

    local oldRankKey = tostring(params.old.id)
    local rank = factionData.ranks[oldRankKey]
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


    factionData.ranks[oldRankKey] = nil
    factionData.ranks[params.new.level] = {
        name        = params.new.name,
        description = params.new.description,
        color       = params.new.color,
        permissions = newPerms
    }

    MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
        json.encode(factionData.ranks),
        factionId
    })


    if oldRankKey ~= tostring(params.new.level) then
        for idf, member in pairs(factionData.members) do
            if tostring(member.rank) == oldRankKey then
                member.rank = params.new.level
                MySQL.update.await("UPDATE faction_members SET rank = ? WHERE identifier = ? AND faction_name = ?", {
                    params.new.level, idf, factionId
                })
            end
        end
    end

    return { success = true, msg = (lang.success["rank_updated"]):format(params.new.name), msgType = "success" }
end)


function SetFactionLeader(identifier, factionId, isLeader)
    local function handleErr(errVal, src)
        if errVal == "faction_missing" then
            mCore.Notify(src, lang.Title, string.format(lang.error["faction_missing"], factionId), "error", 5000)
        elseif errVal == "player_missing" then
            mCore.Notify(src, lang.Title, lang.error["player_missing"])
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, lang.error["db_err"] "error", 5000)
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"] "error", 5000)
        end
    end

    if not Factions[factionId] then
        return false, "faction_missing", handleErr
    end

    local num = 1

    if isLeader == 2 then num = 99 elseif isLeader == 1 then num = 100 else num = 1 end

    local ok, res = pcall(function()
        return MySQL.update.await([[
            UPDATE faction_members
            SET rank = ?
            WHERE identifier = ? AND faction_name = ?
        ]], {
            num,
            identifier,
            factionId
        })
    end)

    if ok then
        if res == 0 then
            return false, "player_missing", handleErr
        end

        Factions[factionId].members[identifier].rank = num

        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
end

exports("SetFactionLeader", SetFactionLeader)



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
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"], "error", 5000)
        end
    end

    local factionConfig = Factions[factionId]
    if not factionConfig then
        return false, "faction_missing", handleErr
    end

    local validPrio, rankData = GetValidRank(newRank, factionConfig.ranks)
    if not validPrio then
        return false, "rank_missing", handleErr
    end

    -- update database
    local ok, res = pcall(function()
        return MySQL.update.await([[
            UPDATE faction_members
            SET rank = ?
            WHERE identifier = ? AND faction_name = ?
        ]], {
            validPrio,
            identifier,
            factionId
        })
    end)

    if ok then
        if res == 0 then
            return false, "player_missing", handleErr
        end

        -- update in-memory cache
        if factionConfig.members[identifier] then
            factionConfig.members[identifier].rank = validPrio
        end

        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
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
        for key, _ in pairs(rank.permissions) do
            table.insert(perms, key)
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
