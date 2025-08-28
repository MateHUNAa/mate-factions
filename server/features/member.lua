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
        local member = faction.mebmers[identifier]
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
                memberData = member
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
    local Player = mCore.getPlayer(pid)

    if not Player then return { msg = "Failed to fetch LocalPlayer", msgType = "error", error = true } end


    local factions = GetPlayerFactions(Player.identifier)
    if #factions <= 0 then
        return { msg = "You are not part of any faction !", msgType = "error" }
    end

    for i, faction in pairs(factions) do
        local rank   = faction.ranks[tostring(faction.memberData.rank)]
        rank.id      = tostring(faction.memberData.rank)
        faction.rank = rank
    end

    local player = {
        id          = pid,
        name        = Player.RPName,
        identifier  = Player.identifier,
        discordName = Player.Name,
        imageUrl    = Player.discord.img,
        factions    = factions
    }

    return { data = player, msg = "Success. " }
end

regServerNuiCallback("requestLocalUser", (function(pid, idf, params, otherParams)
    return getLocalPlayer(pid)
end))

lib.callback.register("mate-factions:GetLocalPlayer", function(source)
    return getLocalPlayer(source)
end)
