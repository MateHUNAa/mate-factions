---@class FactionBadge
---@field badgeNumber string
---@field factionId string
---@field identifier string
---@field rank integer
---@field createdAt number timestamp
local Badge   = {}
Badge.__index = Badge


function Badge:new(badgeNumber, factionId, identifier, rank)
    local self = setmetatable({}, self)
    self.badgeNumber = badgeNumber
    self.factionId = factionId
    if not Functions[self.factionId] then
        return Logger:Error(("No faction found with `%s`"):format(factionId))
    end
    self.faction = Factions[self.factionId]
    self.identifier = identifier
    self.rank = rank or 1

    return self
end

function Badge:save()
    return MySQL.update.await([[
        INSERT INTO faction_badges (badgeNumber, factionId, identifier, rank)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            badgeNumber = VALUES(badgeNumber)
            rank = VALUES(rank)
    ]], { self.badgeNumber, self.factionId, self.identifier, self.rank })
end

function Badge:delete()
    return MySQL.update.await("DELETE FROM faction_badges WHERE identifier  = ? AND factionId = ?",
        { self.identifier, self.factionId })
end

function Badge.loadByIdentifier(identifier, facitonId)
    local res = MySQL.query.await("SELECT * FROM faction_badges WHERE identifier = ? AND factionId = ?",
        { identifier, facitonId })

    if res[1] then
        return Badge:new(res[1].badgeNumber, res[1].factionId, res[1].identifier, res[1].rank)
    end

    return nil
end

function Badge.loadByNumber(badgeNumber)
    local res = MySQL.single.await("SELECT * FROM faction_badges WHERE badgeNumber = ?", { badgeNumber })
    return res or nil
end

function GenerateBadgeNumber(currentRank)
    local badgeNumber
    local exists = true

    local rank = math.max(1, math.min(currentRank, 100))
    local suffix = string.format("%2d", rank)

    while exists do
        local main = math.random(1000, 9999)
        badgeNumber = string.format("%04d-%s", main, suffix)
        exists = Badge.loadByNumber(badgeNumber) ~= nil
    end

    return badgeNumber
end

---@param identifier string
---@param factionId string
---@param badgeNumber? number
---@param rank string
---@reutrn FactionBadge,FactionBadge["badgeNumber"]
function AssignBadgeToPlayer(identifier, factionId)
    local pid = GetPlayerIDByIdentifier(identifier)
    local faction, member, handleErr = GetEffectiveFaction(identifier, pid)

    if not faction then
        return handleErr(member)
    end

    if not pid then
        return false
    end

    if not HasFactionAbility(factionId, "badge") then
        mCore.Notify(pid, lang.Title, (lang.error["no_ability"]):format("badge"), "error", 5000)
        return false
    end

    local exists = Badge.loadByIdentifier(identifier, factionId)

    if exists then return exists, exists.badgeNumber end


    local rank = member.rank or 1
    local badgeNumber = GenerateBadgeNumber(rank)

    local badge = Badge:new(badgeNumber, faction.id, identifier, rank)

    Player(pid).state:set("factionBadge", {
        factionId   = faction.id,
        badgeNumber = badge.badgeNumber,
        rank        = rank,
        holder      = GetPlayerName(pid) -- TODO: use RPname here
    }, true)

    badge:save()

    return badge, badge.badgeNumber
end

exports("useBadge", function(event, item, inventory, slot, data)
    Logger:Debug(
        event,
        item,
        inventory,
        slot,
        data
    )
end)

return Badge
