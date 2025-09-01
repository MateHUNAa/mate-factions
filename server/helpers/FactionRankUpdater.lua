FactionRankUpdater = {}
FactionRankUpdater.__index = FactionRankUpdater

function FactionRankUpdater.new(factionId, rankId)
    local self = setmetatable({}, FactionRankUpdater)
    ---@type Faction
    self.faction = Factions[factionId]
    if not self.faction then
        Logger:Error(("Faction `%s` does not exists"):format(factionId))
        return
    end

    self.rankId = rankId

    ---@type FactionRank
    self.rank = self.faction.ranks[tostring(rankId)]

    if not self.rank then
        return Logger:Error(("Rank `%s` Does not exists in faction `%s`"):format(rankId, factionId))
    end

    self.changes = {}
    return self
end

function FactionRankUpdater:WithName(name)
    self.changes.name = name
    return self
end

function FactionRankUpdater:WithPermissions(permissions)
    self.changes.permissions = permissions
    return self
end

function FactionRankUpdater:WithDescription(desc)
    self.changes.description = desc
    return self
end

function FactionRankUpdater:WithColor(color)
    self.changes.color = color
    return self
end

function FactionRankUpdater:Apply(saveToDb)
    for k, v in pairs(self.changes) do
        self.rank[k] = v
    end

    if saveToDb then
        local ok, err = pcall(function()
            MySQL.update.await("UPDATE factions SET ranks = ? WERE name = ?", {
                json.encode(self.faction.ranks), self.faction.name
            })
        end)

        if not ok then
            return "sql_error", err
        end
    end

    self.changes = {}
    return true, self.rank
end

return FactionRankUpdater
