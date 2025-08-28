local Logger = require("shared.Logger")

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

function SyncDefaultRanks()
    for factionId, faction in pairs(Factions) do
        local changed = false

        for key, defaultRank in pairs(Config.DefaultRanks) do
            local factionRank = faction.ranks[key]

            if not faction.ranks[key] then
                faction.ranks[key] = defaultRank
                changed = true
                Logger:Info(("[^4SyncDefaultRanks^0]: Added missing rank `%s` to faction `%s`"):format(key, factionId))
            else
                for field, value in pairs(defaultRank) do
                    if factionRank[field] == nil then
                        factionRank[field] = value
                        changed = true
                        Logger:Info(("[^4MergeDefaultRanks^0]: Added missing field `%s`=`%s` to rank `%s` in faction `%s`")
                            :format(field, value, factionRank.name, factionId))
                    end
                end
            end
        end

        if changed then
            local ok, err = pcall(function(...)
                MySQL.update.await("UPDATE factions SET ranks = ? WHERE name = ?", {
                    json.encode(faction.ranks),
                    factionId
                })
            end)
            if not ok then
                Logger:Error(("[SyncDefaultRanks]: Failed to sync ranks for faction `%s`: %s"):format(factionId, err))
            end
        end
    end
end

function Init()
    mCore.createSQLTable("factions", {
        "`name` varchar(100) NOT NULL PRIMARY KEY",
        "`label` varchar(100) NOT NULL",
        "`type` varchar(50) NOT NULL",
        "`permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`))",
        "`ranks` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`ranks`))",
        "`allow_offduty` tinyint(1) DEFAULT 0",
        "`offduty_name` varchar(100) DEFAULT NULL",
        "`created_at` datetime DEFAULT current_timestamp()",
        "`duty_point` JSON DEFAULT NULL",
        "`stash` JSON DEFAULT NULL",
        "`settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`settings`))",
        "CONSTRAINT `factions_offduty_fk` FOREIGN KEY(`offduty_name`) REFERENCES `factions`(`name`) ON DELETE SET NULL"
    })

    mCore.createSQLTable("faction_members", {
        "`identifier` varchar(100) NOT NULL",
        "`faction_name` varchar(100) NOT NULL",
        "`rank` int(11) DEFAULT 0",
        "`title` varchar(50) DEFAULT NULL",
        "`on_duty` tinyint(1) DEFAULT 1",
        "`joined_at` datetime DEFAULT current_timestamp()",
        "PRIMARY KEY(`identifier`, `faction_name`)",
        "KEY `faction_name` (`faction_name`)",
        "KEY `identifier` (`identifier`)",
        "CONSTRAINT `faction_members_ibfk_1` FOREIGN KEY(`faction_name`) REFERENCES `factions` (`name`) ON DELETE CASCADE"
    })


    Wait(500)

    LoadFactions()
    LoadFactionMembers()

    if Config.AutoSyncDefaultRanks then
        SyncDefaultRanks()
    end

    TriggerClientEvent("mate-factions:AddAllDutyMarker", -1, Factions)

    isLoaded = true
end
