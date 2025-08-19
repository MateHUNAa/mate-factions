local lang = Loc[Config.lan]
function LoadFactions()
    local res = MySQL.query.await("SELECT * FROM factions")
    for _, row in pairs(res) do
        Factions[row.name] = {
            label = row.label,
            type = row.type,
            ranks = json.decode(row.ranks or "{}"),
            permissions = json.decode(row.permissions or "{}"),
            allow_offduty = row.allow_offduty == 1,
            offduty_name = row.offduty_name,
            members = {},
            duty_point = row.duty_point and json.decode(row.duty_point) or nil
        }
    end

    Logger:Info(("Loaded %s factions"):format(#res))
    return true
end

function LoadFactionMembers()
    local res = MySQL.query.await("SELECT * FROM faction_members")
    for _, row in pairs(res) do
        local faction = Factions[row.faction_name]
        if faction then
            faction.members[row.identifier] = {
                rank      = row.rank,
                title     = row.title,
                on_duty   = 0,
                joined_at = row.joined_at
            }
        end
    end

    Logger:Info("Loaded faction members")
end

function GetFactionConfig(factionName)
    return Factions[factionName] or nil
end

function GetEffectiveFaction(identifier)
    -- Return player faction, and factionConfig
end

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
            offduty_name = nil
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

function SetPlayerFaction(identifier, factionId)
    local function handleErr(errVal, src)
        if errVal == "faction_missing" then
            mCore.Notify(src, lang.Title, string.format(lang.error["faction_missing"], factionId), "error", 5000)
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, lang.error["db_err"] "error", 5000)
        else
            mCore.Notify(src, lang.Title, lang.error["unknown_error"] "error", 5000)
        end
    end


    local factionConfig = Factions[factionId]
    if not factionConfig then
        return false, 'faction_missing', handleErr
    end

    local ok, result = pcall(function()
        return MySQL.insert.await([[
            INSERT INTO faction_members (identifier, faction_name, rank, on_duty, joined_at)
            VALUES (?,?,?,?,NOW())
            ON DUPLICATE KEY UPDATE faction_name = VALUES(faction_name), rank = 0
        ]], {
            identifier,
            factionId,
            0,
            0
        })
    end)

    if ok then
        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
end

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

    local ok, res = pcall(function()
        return MySQL.update.await([[
            UPDATE faction_members
            SET rank = ?
            WHERE identifier = ? AND faction_name = ?
        ]], {
            isLeader,
            identifier,
            factionId
        })
    end)

    if ok then
        if res == 0 then
            return false, "player_missing", handleErr
        end

        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
end

--
-- Ranking System
--

function GetFactionMemeberRank(identifier, factionId)
    local member = Factions[factionId] and Factions[factionId].members[identifier]
    if not member then return nil end
    local rankId = tonumber(member.rank)
    return Factions[factionId].ranks[rankId]
end

function IsLeader(identifier, factionId)
    local member = Factions[factionId] and Factions[factionId].members[identifier]
    if not member then return false, false end
    local rankId = member.rank

    return rankId == 100, rankId == 99
end

function AddRank(factionId, rankId, name, permissions)
    local faction = Factions[factionId]
    if not faction then return false end

    faction.ranks[tostring(rankId)] = {
        name = name,
        permissions = permissions or {}
    }

    MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
        json.encode(faction.ranks),
        factionId
    })
end

function RemoveRank(factionId, rankId)
    local faction = Factions[factionId]
    if not faction then return false end

    faction.ranks[tostring(rankId)] = nil

    MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
        json.encode(faction.ranks),
        factionId
    })
end
