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
            offduty_name = row.offduty_name
        }
    end

    Logger:Info(("Loaded %s factions"):format(#res))
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
            mCore.Notify(src, lang.Title, "error", "This faction already exists!", 5000)
        elseif errVal == "sql_error" then
            mCore.Notify(src, lang.Title, "error", "Database error, check logs.", 5000)
        else
            mCore.Notify(src, lang.Title, "error", "Unknown issue while creating faction.", 5000)
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
            "{}",
            0
        })
    end)

    if ok then
        Factions[name] = {
            label = label,
            type = type,
            ranks = {},
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
