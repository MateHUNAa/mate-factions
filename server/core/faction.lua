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

    local abilities = Config.FactionAbilities[type or "job"] or {}

    local ok, result = pcall(function()
        return MySQL.insert.await([[
            INSERT INTO factions (name, label, type, permissions, ranks, allow_offduty)
            VALUES (?,?,?,?,?,?)
        ]], {
            name,
            label,
            type,
            json.encode(abilities or "{}"),
            json.encode(Config.DefaultRanks),
            0
        })
    end)

    if ok then
        Factions[name] = {
            id            = name,
            name          = name,
            label         = label,
            type          = type,
            ranks         = Config.DefaultRanks,
            permissions   = abilities,
            allow_offduty = false,
            offduty_name  = nil,
            members       = {},
            duty_point    = nil,
            posts         = {},
            stash         = nil
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

function GetEffectiveFaction(factionId, identifier)
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

    local member = faction.members[identifier]
    if not member then
        return nil, "not_member", handleErr
    end

    return faction, member, handleErr
end

local function GenerateText(num)
    local str
    repeat
        str = {}
        for i = 1, num do str[i] = string.char(math.random(65, 90)) end
        str = table.concat(str)
    until str ~= 'POL' and str ~= 'EMS'
    return str
end

local function GenerateSerial(text)
    if text and text:len() > 3 then
        return text
    end
    return ('%s%s%s'):format(math.random(100000, 999999), text == nil and GenerateText(3) or text,
        math.random(100000, 999999))
end


---@param faction Faction
---@param pos vector3
function RegisterStash(faction, pos)
    if faction.stash then return Logger:Error("Tried to registerStash for faction: ", faction.id) end

    local stashId = GenerateSerial()
    ox_inventory:RegisterStash('fac_' .. stashId, ("%s Storage"):format(faction.label), 8000, 800000, false)


    faction.stash = pos

    Logger:Info(("Registered stash for faction %s"):format(faction.id))
end

function SyncFactionMembers(factionId)
    Logger:Debug(("Syncing %s members !"):format(factionId))


    local faction = Factions[factionId]
    if not faction then return false end

    for idf, member in pairs(faction.members) do
        local pid = nil

        for _, p in pairs(GetPlayers()) do
            local license = GetPlayerIdentifierByType(p, "license"):sub(9)
            if license == idf then
                pid = p
            end
        end

        if not pid then goto continue end

        local playerFactions = {}
        local factionTypes = {}

        for fid, f in pairs(Factions) do
            local m = f.members[idf]
            if m then
                table.insert(playerFactions, {
                    id       = fid,
                    name     = fid,
                    label    = f.label,
                    settings = f.settings,
                    rank     = m.rank,
                    on_duty  = m.on_duty == 1,
                    ranks    = f.ranks,
                    type     = f.type
                })
                factionTypes[fid] = true
            else
                factionTypes[fid] = false
            end
        end

        Logger:Debug(("Synced %s members"):format(factionId))
        TriggerClientEvent("mate-factions:updateClientFactionTypes", pid, factionTypes, playerFactions)
        ::continue::
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

        SyncPlayerFactions(nil, identifier)
        return true, nil, handleErr
    else
        return false, "sql_error", handleErr
    end
end

exports("SetFactionLeader", SetFactionLeader)

---@param factionId string
---@param ability FactionAbilities
function HasFactionAbility(factionId, ability)
    local faction = Factions[factionId]
    if not faction then
        return Logger:Debug(("[HasFactionAbility]: %s is not exists"):format(factionId))
    end

    local abilities = Config.FactionAbilities[faction.type]

    return abilities[ability] or false
end
