local Logger = require('shared.Logger')

function SetPlayerFaction(identifier, factionId)
    local function handleErr(errVal, src)
        if errVal == "faction_missing" then
            mCore.Notify(src, lang.Title, string.format(lang.error["faction_missing"], factionId), "error", 5000)
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, lang.error["db_err"] "error", 5000)
        elseif errVal == "already_in_this_faction" then
            mCore.Notify(src, lang.Title, lang.error["same_faction"] "error", 5000)
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"] "error", 5000)
        end
    end


    local factionConfig = Factions[factionId]
    if not factionConfig then
        return false, 'faction_missing', handleErr
    end

    local exists = MySQL.query.await("SELECT 1 FROM faction_members WHERE identifier = ? AND faction_name = ?", {
        identifier, factionId
    })

    if #exists > 0 then
        return true, "already_in_this_faction", handleErr
    end

    local ok, result = pcall(function()
        return MySQL.insert.await([[
            INSERT INTO faction_members (identifier, faction_name, rank, on_duty, joined_at)
            VALUES (?,?,?,?,NOW())
            ON DUPLICATE KEY UPDATE faction_name = VALUES(faction_name), rank = 0
        ]], {
            identifier,
            factionId,
            1,
            0
        })
    end)

    if ok then
        Factions[factionId].members[identifier] = {
            rank      = 1,
            on_duty   = 0,
            joined_at = os.time()
        }
        SyncPlayerFactions(nil, identifier)
        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
end

exports("SetPlayerFaction", SetPlayerFaction)

function GetPlayerFaction(identifier)
    for factionName, factionData in pairs(Factions) do
        local memberData = factionData.members[identifier]
        if memberData then
            return factionName, factionData, memberData
        end
    end

    return nil, nil, nil
end

exports("GetPlayerFaction", GetPlayerFaction)

function GetPlayerFactions(identifier)
    local playerFactions = {}

    for factionId, faction in pairs(Factions) do
        local member = faction.members[identifier]
        if member then
            table.insert(playerFactions, {
                id         = factionId,
                name       = factionId,
                label      = faction.label,
                settings   = faction.settings,
                rank       = member.rank,
                on_duty    = member.on_duty == 1,
                ranks      = faction.ranks,
                type       = faction.type,
                memberData = member,
                members    = faction.members
            })
        end
    end

    return playerFactions
end

function SetPlayerDuty(identifier, onDuty)
    local factionId, factionData, memberData = GetPlayerFaction(identifier)
    if not factionId then return false end

    memberData.on_duty = onDuty and 1 or 0
    memberData.lastActive = os.time()

    MySQL.update.await([[
        UPDATE faction_members
        SET on_duty = ?, last_active = NOW()
        WHERE identifier = ? AND faction_name = ?
    ]], {
        memberData.on_duty,
        identifier,
        factionId
    })

    return true
end

exports("SetPlayerDuty", SetPlayerDuty)

function SyncPlayerFactions(src, identifier)
    if not identifier then
        return Logger:Error(("Failed to `SyncPlayerFactions` no identifier, invoke: (%s)"):format(
            GetInvokingResource() or GetCurrentResourceName()))
    end

    identifier = identifier:gsub("license:", "")

    Logger:Debug("Syncing factions for player:", identifier)
    local playerFactions = {}
    local factionTypes = {}

    local now = GetGameTimer()
    while not isLoaded do
        if GetGameTimer() - now > 10000 then
            Logger:Error("Timeout waiting for player to load factions:", identifier)
            return
        end
        Citizen.Wait(100)
    end

    if not src then
        local playerId = GetPlayerServerIdByIdentifier(identifier)
        if not playerId then return Logger:Error("Failed to `SyncPlayerFactions` no playerId givven !") end
        src = playerId
    end

    for factionId, faction in pairs(Factions) do
        local member = faction.members[tostring(identifier)]
        -- Logger:Debug("Checking faction:", factionId, "Member data:", member)
        if member then
            local entry = {
                id       = factionId,
                name     = factionId,
                label    = faction.label,
                settings = faction.settings,
                rank     = member.rank,
                on_duty  = member.on_duty == 1,
                ranks    = faction.ranks,
                type     = faction.type
            }
            table.insert(playerFactions, entry)

            factionTypes[factionId] = true
        else
            factionTypes[factionId] = false
        end
    end

    TriggerClientEvent("mate-factions:updateClientFactionTypes", src, factionTypes, playerFactions)
end

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    SyncPlayerFactions(playerId, xPlayer.identifier)
end)

RegisterNetEvent("mate-factions:updatePlayerFaction", function(identifier)
    local src = source
    if not identifier then
        identifier = GetPlayerIdentifierByType(src, "license")
    end

    if not identifier then
        return Logger:Error(("Failed to `updatePlayerFaction` no identifier, invoke: (%s)"):format(
            GetInvokingResource() or GetCurrentResourceName()))
    end

    SyncPlayerFactions(src, identifier)
end)


function getLocalPlayer(pid)
    local start = GetGameTimer()
    while not isLoaded do
        local now = GetGameTimer()
        if start - now > 5000 then
            Logger:Error("getLocalPlayer Timedout factions resource is not loaded !")
            break
        end
        Wait(250)
    end
    local Player = mCore.getPlayer(pid)

    if not Player then
        Logger:Error(("Failed to get Player > %s(%s)"):format(GetPlayerName(pid), pid))
        return nil
    end


    local factions = GetPlayerFactions(Player.identifier)
    if #factions <= 0 then
        return mCore.Notify(pid, lang.Title, lang.error["not_in_faction"], "error", 5000)
    end

    for i, faction in pairs(factions) do
        local rank          = faction.ranks[tostring(faction.memberData.rank)]
        rank.id             = tostring(faction.memberData.rank)
        faction.rank        = rank
        faction.memberCount = #faction?.members or 0
    end

    local player = {
        id          = pid,
        name        = Player.RPName,
        identifier  = Player.identifier,
        discordName = Player.Name,
        imageUrl    = Player.discord.img,
        factions    = factions
    }

    return player
end

regServerNuiCallback("requestLocalUser", (function(pid, idf, params, otherParams)
    return { data = getLocalPlayer(pid) }
end))

regServerNuiCallback("requestPlayerFactions", function(pid, idf, params)
    return { data = getLocalPlayer(pid).factions }
end)

lib.callback.register("mate-factions:GetLocalPlayer", function(source)
    return getLocalPlayer(source)
end)

regServerNuiCallback("requestFactionMembers", function(pid, idf, factionId)
    if not factionId then return { msg = "No factionId provided !", msgType = "error", error = true } end
    local faction = Factions[factionId]

    if not faction then return { msg = ("No faction found with id: `%s`"):format(factionId), msgType = "error" } end

    local members = {}

    local function GetPlayerAvatar(idf)
        return MySQL.single.await("SELECT discord_url, discord_name FROM users WHERE identifier = ?", { idf })
    end

    for memberIdf, memberData in pairs(faction.members) do
        local rank = faction.ranks[tostring(memberData.rank)]
        if not rank then
            local newPrio, newRank = GetValidRank(memberData.rank, faction.ranks)
            SetPlayerRank(memberIdf, factionId, newPrio)

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
            faction    = factionId
        })
    end

    return {
        data = members
    }
end)


function kickFactionMember(identifier, factionId)
    if not identifier or not factionId then return false end

    local faction = Factions[factionId]
    if not faction then return false end

    local member = faction.members[identifier]
    if not member then return false end

    faction.members[identifier] = nil

    local playerId = GetPlayerServerIdByIdentifier(identifier)
    if playerId then
        SyncPlayerFactions(playerId, identifier)
    end

    local ok, r = pcall(function(...)
        MySQL.query.await("DELETE FROM faction_members WHERE identifier = ? AND faction_name = ?",
            { identifier, factionId })
    end)

    if not ok then
        Logger:Error('[kickFactionMember]', r, identifier, factionId)

        return false
    end

    return true
end

regServerNuiCallback("updateFactionMember", function(pid, idf, params)
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

    if not MemberHasPermission(idf, params.factionId, "manageMembers") then
        return { msg = (lang.error["permission_missing"]):format("manageMembers"), msgType = "error", error = false }
    end

    local targetMember = faction.members[params.target.identifier]
    if not targetMember then
        return { msg = lang.error["player_missing"], msgType = "error" }
    end

    if params.rankId and params.rankId ~= -1 then
        local validRank, rankData = GetValidRank(params.rankId, faction.ranks)

        if validRank > member.rank then
            Logger:Info(("`%s` Tried to give a higher rank than him self !"):format(idf))
            validRank = params.targetOldRankId
        end

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
            params.factionId,
            targetMember.rank,
            targetMember.on_duty or 0,
        })
    end)

    if not ok then
        Logger:Error(("Failed to update faction member `%s`: %s"):format(params.target.name, err))
        return { msg = "Database error!", msgType = "error", error = true }
    end

    SyncPlayerFactions(nil, params.target.identifier)
    return { success = true, msg = (lang.success["member_updated"]):format(params.target.name), msgType = "success" }
end)


---@param pid any
---@param idf any
---@param params { target: string, factionId: string }
regServerNuiCallback("promoteFactionMember", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = (lang.error["faction_missing"]):format(params.factionId), msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = lang.error["not_member"], msgType = "error", error = true }
    end

    if not MemberHasPermission(idf, params.factionId, "manageMembers") then
        return { msg = (lang.error["permission_missing"]):format("manageMembers"), msgType = "error", error = true }
    end

    local targetMember = faction.members[params.target]
    if not targetMember then
        return { msg = lang.error["player_missing"], msgType = "error", error = true }
    end

    if targetMember.rank >= member.rank then
        return { msg = (lang.error["category_action_reason"]):format("promote"), msgType = "error", error = true }
    end

    -- Get the next higher rank
    local nextPrio, nextRank = GetAdjacentRank(targetMember.rank, faction.ranks, "up")
    if not nextPrio or not nextRank then
        return { msg = lang.error["no_higher_rank"], msgType = "error", error = true }
    end

    -- Promote
    Logger:Info(("%s Promoted from %s(%s) to %s(%s)"):format(
        params.target,
        faction.ranks[tostring(targetMember.rank)].name,
        targetMember.rank,
        nextRank.name,
        nextPrio
    ))

    SetPlayerRank(params.target, params.factionId, nextPrio)

    return { msg = (lang.success["promoted"]):format(params.target, nextRank.name), msgType = "success", error = false }
end)


---@param pid any
---@param idf any
---@param params { target: string, factionId: string }
regServerNuiCallback("demoteFactionMember", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = (lang.error["faction_missing"]):format(params.factionId), msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = lang.error["not_member"], msgType = "error", error = true }
    end

    if not MemberHasPermission(idf, params.factionId, "manageMembers") then
        return { msg = (lang.error["permission_missing"]):format("manageMembers"), msgType = "error", error = true }
    end

    local targetMember = faction.members[params.target]
    if not targetMember then
        return { msg = lang.error["player_missing"], msgType = "error", error = true }
    end

    if targetMember.rank >= member.rank then
        return { msg = (lang.error["category_action_reason"]):format("demote"), msgType = "error", error = true }
    end

    local nextPrio, nextRank = GetAdjacentRank(targetMember.rank, faction.ranks, "down")
    if not nextPrio or not nextRank then
        return { msg = lang.error["no_lower_rank"], msgType = "error", error = true }
    end

    -- Demote
    Logger:Info(("%s Demoted from %s(%s) to %s(%s)"):format(
        params.target,
        faction.ranks[tostring(targetMember.rank)].name,
        targetMember.rank,
        nextRank.name,
        nextPrio
    ))

    SetPlayerRank(params.target, params.factionId, nextPrio)

    return { msg = (lang.succes["demoted"]):format(params.target, nextRank.name), msgType = "success", error = false }
end)


---@param pid any
---@param idf any
---@param params { target: string, factionId: string }
regServerNuiCallback("kickFactionMember", function(pid, idf, params)
    local faction = Factions[params.factionId]
    if not faction then
        return { msg = (lang.error["faction_missing"]):format(params.factionId), msgType = "error", error = true }
    end

    local member = faction.members[idf]
    if not member then
        return { msg = lang.error["not_member"], msgType = "error", error = true }
    end

    if not MemberHasPermission(idf, params.factionId, "kickMembers") then
        return { msg = (lang.error["permission_missing"]):format("kickMembers"), msgType = "error", error = true }
    end

    local targetMember = faction.members[params.target]
    if not targetMember then
        return { msg = lang.error["player_missing"], msgType = "error", error = true }
    end

    if targetMember.rank >= member.rank then
        return { msg = (lang.error["category_action_reason"]):format("kick"), msgType = "error", error = true }
    end

    kickFactionMember(params.target, params.factionId)

    Logger:Info(("%s kicked from faction %s by %s"):format(
        params.target,
        params.factionId,
        idf
    ))

    return { msg = (lang.success["kicked"]):format(params.target), msgType = "success", error = false }
end)
