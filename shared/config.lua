Config = {
     lan = "en",
     PedRenderDistance = 80.0,
     target = true,
     eventPrefix = "mhScripts"
}
Config.MHAdminSystem = GetResourceState("mate-admin") == "started"
Config.ApprovedLicenses = {
     "license:123",
     "fivem:123",
     "discord:123",
     "live:123",
     "steam:123",
     "xbl:123"
}

Config.PermissionList = {
     "manageRanks",
     "manageMembers",
     "manageNews",
     "kickMembers",
     "stashAccess",
}

Config.AutoSyncDefaultRanks = true
Config.DefaultRanks = {
     ["1"] = {
          name = "Recruit",
          permissions = {},
          description = "Description is not set.",
          color = "#64748B",
     },
     ["2"] = {
          name = "Member",
          permissions = { ["stashAccess"] = true },
          description = "Description is not set.",
          color = "#3B82F6"
     },
     ["99"] = {
          name = "Sub-Leader",
          permissions = { ["manageRanks"] = true, ["invite"] = true, ["manageMembers"] = true, ["stashAccess"] = true },
          description = "Description is not set.",
          color = "#6366F1"
     },
     ["100"] = {
          name = "Leader",
          permissions = { ["all"] = true },
          description = "Description is not set.",
          color = "#F59E0B"
     },

}

---@alias FactionType "job" | "gang" | "organization" | "maffia"
Config.ValidFactionTypes = {
     "gang",
     "maffia",
     "job", -- DEFAULT
     "organization"
}

Config.Debug = true

Config.BadgeItem = "badge"

Config.DutyMarker = {
     streamDistance = 25,
     typ            = 1,
     scale          = vector3(0.7, 0.7, 0.7),
     upDown         = false,
     rotate         = false,
     color          = { 88, 255, 88, 150 }
}


Loc = {}
