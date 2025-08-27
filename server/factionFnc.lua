local lang = Loc[Config.lan]
function LoadFactions()
    local res = MySQL.query.await("SELECT * FROM factions")
    for _, row in pairs(res) do
        Factions[row.name] = {
            label         = row.label,
            type          = row.type,
            ranks         = json.decode(row.ranks or "{}"),
            permissions   = json.decode(row.permissions or "{}"),
            settings      = json.decode(row.settings or '{"allowDuty":true,"payment":true,"robbery":false}'),
            allow_offduty = row.allow_offduty == 1,
            offduty_name  = row.offduty_name,
            members       = {},
            duty_point    = row.duty_point and json.decode(row.duty_point) or nil,
            stash         = row.stash and json.decode(row.stash) or nil,
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

exports("GetFactionConfig", GetFactionConfig)

function GetEffectiveFaction(identifier)
    for facId, facData in pairs(Factions) do
        for memberIdf, memberData in pairs(facData.members) do
            if memberIdf == identifier then
                return facId, facData, memberData
            end
        end
    end
end

exports("GetEffectiveFaction", GetEffectiveFaction)

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
--
-- Ranking System
--

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

    -- validate rank using helper
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
end

exports("RemoveRank", RemoveRank)

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


function GetFactionSetting(factionId, setting)
    local faction = Factions[factionId]
    if not faction then return nil end

    return faction.settings and faction.settings[setting] or nil
end

exports("GetFactionSetting", GetFactionSetting)

function SetFactionSetting(factionId, setting, value)
    -- TODO: Allow admins to change faction.settings
end

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
