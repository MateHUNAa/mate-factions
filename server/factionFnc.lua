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
