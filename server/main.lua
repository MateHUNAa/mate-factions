ESX = exports['es_extended']:getSharedObject()
mCore = exports["mCore"]:getSharedObj()
local inv = exports["ox_inventory"]
local lang = Loc[Config.lan]
isLoaded = false



---@class FactionRanks
---@param name string
---@param permissions table

---@class Faction
---@param name string (FactionId)
---@param label string
---@param type FactionType
---@param ranks FactionRanks[]
---@param permissions table
---@param allow_offduty boolean
---@param duty_point vector4
---@param mebmers FactionMember[]

---@class FactionMember
---@param rank { name: string, permissions: table}
---@param title string
---@param on_duty boolean
---@param joined_at Date


Factions = {}

Citizen.CreateThread(function()
    Init()
end)

lib.callback.register("mate-faction:RequestFactions", (function(src)
    return Factions
end))

lib.callback.register("mate-faction:GetPlayerFaction", (function(src)
    local Player = mCore.getPlayer(src)
    if not Player then return end

    local idf = Player.identifier


    for factionId, factionData in pairs(Factions) do
        if factionData.members then
            for memberIdentifier, memberData in pairs(factionData.members) do
                if memberIdentifier == idf then
                    return {
                        factionId = factionId,
                        factionData = factionData,
                        memberData = memberData
                    }
                end
            end
        end
    end

    return nil
end))

regServerNuiCallback("requestFactionMembers", function(pid, idf, params)
    local factionName, factionData, myData = GetPlayerFaction(idf)

    if not factionName then return { data = nil, msg = "This player is not part of a faction !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not myData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    local members = {}

    local function GetPlayerAvatar(idf)
        return MySQL.single.await("SELECT discord_url, discord_name FROM users WHERE identifier = ?", { idf })
    end

    for memberIdf, memberData in pairs(factionData.members) do
        local rank = factionData.ranks[tostring(memberData.rank)]

        if not rank then
            local newPrio, newRank = GetValidRank(memberData.rank, factionData.ranks)
            SetPlayerRank(memberIdf, factionName, newPrio)
            return { error = true, msg = ("No rank for player: `%s`"):format(memberIdf), msgType = "error" }
        end

        rank.id = memberData.rank

        local Player = mCore.getPlayer(memberIdf)

        local status = "offline"
        if Player then
            status = (memberData.on_duty and memberData.on_duty >= 1) and "online" or "away"
        end

        local stuff = GetPlayerAvatar(memberIdf) or {}
        table.insert(members, {
            identifier = memberIdf,
            rank       = rank,
            rankColor  = rank.color or "#ff0000",
            joinDate   = memberData.joined_at,
            lastActive = memberData.lastActive or 0,
            status     = status,
            avatar     = stuff.discord_url or "",
            name       = stuff.discord_name or memberIdf,
            faction    = factionName
        })
    end

    return {
        data = members
    }
end)

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    TriggerClientEvent("mate-factions:AddAllDutyMarker", playerId, Factions)
end)

function getLocalPlayer(pid)
    local Player = mCore.getPlayer(pid)

    if not Player then return { msg = "Failed to fetch LocalPlayer", msgType = "error", error = true } end

    local factionName, factionData, memberData = GetPlayerFaction(Player.identifier)

    if not factionName then return { data = nil, msg = "This player is not part of a faction !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not memberData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    local player = {
        id          = pid,
        name        = Player.RPName,
        identifier  = Player.identifier,
        discordName = Player.Name,
        imageUrl    = Player.discord.img,
        faction     = factionName,
        factionData = factionData,
        rank        = factionData.ranks[tostring(memberData.rank)],
        memberData  = memberData
    }

    return { data = player, msg = "Success. " }
end

regServerNuiCallback("requestLocalUser", (function(pid, idf, params, otherParams)
    return getLocalPlayer(pid)
end))

lib.callback.register("mate-factions:GetLocalPlayer", function(source)
    return getLocalPlayer(source)
end)


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

regServerNuiCallback("updateFactionMember", function(pid, idf, params)
    local Player = mCore.getPlayer(pid)
    if not Player then return end

    local factionId, factionData, memberData = GetPlayerFaction(Player.identifier)

    if not factionId then return { data = nil, msg = "This player is not part of a factionId !", msgType = "error", error = true } end
    if not factionData then return { data = nil, msg = ("Failed to fetch `%s` factionData !"), msgType = "error", error = true } end
    if not memberData then return { data = nil, msg = "Failed to fetch your memberData !", msgType = "error", error = true } end

    if not MemberHasPermission(idf, factionId, "manageMembers") then
        return { msg = (lang.error["permission_missing"]):format("manageMembers"), msgType = "error", error = false }
    end

    local targetMember = factionData.members[params.target.identifier]
    if not targetMember then
        return { msg = lang.error["player_missing"], msgType = "error" }
    end

    if params.rankId and params.rankId ~= -1 then
        local validRank, rankData = GetValidRank(params.rankId, factionData.ranks)
        if validRank then
            targetMember.rank = validRank
        end
    end

    if params.notes then
        targetMember.notes = params.notes
    end

    local ok, err = pcall(function()
        MySQL.update.await([[
            INSERT INTO faction_members (identifier, faction_name, rank, on_duty)
            VALUES (?,?,?,?)
            ON DUPLICATE KEY UPDATE
                rank = VALUES(rank),
                on_duty = VALUES(on_duty),
                joined_at = VALUES(joined_at)
        ]], {
            params.target.identifier,
            factionId,
            targetMember.rank,
            targetMember.on_duty or 0,
        })
    end)

    if not ok then
        Logger:Error(("Failed to update faction member `%s`: %s"):format(params.target.name, err))
        return { msg = "Database error!", msgType = "error", error = true }
    end

    return { success = true, msg = (lang.success["member_updated"]):format(params.target.name), msgType = "success" }
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
