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

Config.DefaultRanks = {
     ["1"] = {
          name = "Recruit",
          permissions = {},
          description = "Description is not set."
     },
     ["2"] = {
          name = "Member",
          permissions = {},
          description = "Description is not set."
     },
     ["99"] = {
          name = "Sub-Leader",
          permissions = { "manage_ranks", "invite" },
          description = "Description is not set."
     },
     ["100"] = {
          name = "Leader",
          permissions = { "all" },
          description = "Description is not set."
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
