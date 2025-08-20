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

    TriggerClientEvent("mate-factions:AddAllDutyMarker", -1, Factions)

    isLoaded = true
end
