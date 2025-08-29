local lang = Loc[Config.lan]
local Logger = require("shared.Logger")


function SaveFactionData(factionId, saveMembers)
    local faction = Factions[factionId]
    if not faction then return false, "faction_missing" end

    local ok, err = pcall(function()
        MySQL.update.await([[
            UPDATE factions
            SET
                label = ?,
                type = ?,
                ranks = ?,
                permissions = ?,
                settings = ?,
                allow_offduty = ?,
                offduty_name = ?,
                duty_point = ?,
                stash = ?
            WHERE name = ?
        ]], {
            faction.label,
            faction.type,
            json.encode(faction.ranks),
            json.encode(faction.permissions),
            json.encode(faction.settings),
            faction.allow_offduty and 1 or 0,
            faction.offduty_name,
            faction.duty_point and json.encode(faction.duty_point) or nil,
            faction.stash and json.encode(faction.stash) or nil,
            factionId
        })
    end)

    if not ok then
        Logger:Error(("SaveFactionData failed for `%s`: %s"):format(factionId, err))
        return false, "sql_error"
    end

    if saveMembers then
        SaveFactionMembers(factionId)
    end

    return true
end

function SaveFactionMembers(factionId)
    local faction = Factions[factionId]
    if not faction then return false, "faction_missing" end

    for identifier, member in pairs(faction.members) do
        MySQL.update.await([[
            INSERT INTO faction_members (identifier, faction_name, rank, on_duty, joined_at)
            VALUES (?,?,?,?,FROM_UNIXTIME(?))
            ON DUPLICATE KEY UPDATE rank = VALUES(rank), on_duty = VALUES(on_duty), joined_at = VALUES(joined_at)
        ]], {
            identifier,
            factionId,
            member.rank,
            member.on_duty,
            member.joined_at
        })
    end
end

function GetFactionConfig(factionName)
    return Factions[factionName] or nil
end

exports("GetFactionConfig", GetFactionConfig)

function InsertFaction(name, label, type)
    local function handleErr(errVal, src)
        if not errVal or type(errVal) == "nil" then
            return
        end

        if errVal == "duplicate" then
            mCore.Notify(src, lang.Title, string.format(lang.error["duplicate_faction"], name) "error", 5000)
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, lang.error["db_err"] "error", 5000)
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"] "error", 5000)
        end
    end

    local ok, result = pcall(function()
        return MySQL.insert.await([[
            INSERT INTO factions (name, label, type, permissions, ranks, allow_offduty)
            VALUES (?,?,?,?,?,?)
        ]], {
            name,
            label,
            type,
            "{}",
            json.encode(Config.DefaultRanks),
            0
        })
    end)

    if ok then
        Factions[name] = {
            label = label,
            type = type,
            ranks = Config.DefaultRanks,
            permissions = {},
            allow_offduty = false,
            offduty_name = nil,
            members = {}
        }

        TriggerClientEvent("mate-factions:FactionCreated", -1, name, Factions[name])
        TriggerEvent("mate-factions:FactionCreated", name, Factions[name])

        return true, nil, handleErr
    else
        if result and string.find(result, "Duplicate entry") then
            return false, "duplicate", handleErr
        else
            return false, "sql_error", handleErr
        end
    end
end

exports('InsertFaction', InsertFaction)

function GetFactionSetting(factionId, setting)
    local faction = Factions[factionId]
    if not faction then return nil end

    return faction.settings and faction.settings[setting] or nil
end

exports("GetFactionSetting", GetFactionSetting)

function SetFactionSetting(factionId, setting, value)
    -- TODO: Allow admins to change faction.settings
end

function GetEffectiveFaction(factionId, memberId)
    local function handleErr(ID, err, ...)
        if type(err) == "table" then
            return true
        end

        if err == "faction_missing" then
            mCore.Notify(ID, lang.Title, (lang.error["faction_missing"]):format(factionId), "error", 5000)
        elseif err == "not_member" then
            mCore.Notify(ID, lang.Title, lang.error["not_member"], "error", 5000)
        elseif err == "permission_missing" then
            mCore.Notify(ID, lang.Title, (lang.error["permission_missing"]):format(...), "error", 5000)
        end

        return false
    end

    local faction = Factions[factionId]
    if not faction then
        return nil, "faction_missing", handleErr
    end

    local member = faction.members[memberId]
    if not member then
        return nil, "not_member", handleErr
    end

    return faction, member, handleErr
end
