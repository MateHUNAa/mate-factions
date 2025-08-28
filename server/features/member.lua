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

function SyncPlayerFactions(source, identifier)
    local playerFactions = {}
    local factionTypes = {}

    for factionId, faction in pairs(Factions) do
        local member = faction.members[identifier]
        if member then
            local entry = {
                id = factionId,
                name = factionId,
                lalbe = faction.label,
                settings = faction.settings,
                rank = member.rank,
                on_duty = member.on_duty == 1,
                ranks = faction.ranks,
                type = faction.type
            }
            table.insert(playerFactions, entry)

            factionTypes[factionId] = true
        else
            factionTypes[factionId] = false
        end
    end

    TriggerClientEvent("mate-factions:updateClientFactionTypes", source, factionTypes, playerFactions)
end

AddEventHandler('esx:playerLoaded', function(playerId, xPlayer, isNew)
    SyncPlayerFactions(playerId, xPlayer.identifier)
end)
