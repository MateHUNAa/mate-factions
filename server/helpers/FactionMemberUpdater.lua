local FactionMemberUpdater = {}
FactionMemberUpdater.__index = FactionMemberUpdater


---@param playerIdentifier string
---@param factionId string
function FactionMemberUpdater.new(playerIdentifier, factionId)
     local self = setmetatable({}, FactionMemberUpdater)
     self.playerIdentifier = playerIdentifier
     ---@type Faction
     self.faction = Factions[factionId]
     if not self.faction then
          return Logger:Error(("Faction `%s` does not exists"):format(factionId))
     end

     ---@type FactionMember
     self.member = self.faction.members[playerIdentifier]
     if not self.member then
          Logger:Debug(("Player `%s` is not a member of faction `%s`"):format(playerIdentifier, factionId))
     end

     self.changes = {}
     return self
end

function FactionMemberUpdater:WithRank(rank)
     local ok, rankObj = GetValidRank(rank, self.faction.ranks)
     if not ok then
          self._rankError = true
          return self
     end

     self.changes.rank = ok
     return self
end

function FactionMemberUpdater:WithNotes(notes)
     self.changes.notes = notes
     return self
end

function FactionMemberUpdater:WithDutyStatus(onDuty)
     self.changes.on_duty = onDuty
     return self
end

function FactionMemberUpdater:Apply(saveToDb)
     for k, v in pairs(self.changes) do
          self.member[k] = v
     end

     local success   = true
     local errVal    = nil

     local dbUpdates = {}
     if saveToDb then
          if self.changes.rank then
               if self._rankError then
                    errVal = self._rankError
                    self.changes.rank = nil
               else
                    dbUpdates.rank = self.changes.rank
               end
          end

          if self.changes.notes then
               dbUpdates.notes = self.changes.notes
          end

          if self.changes.on_duty ~= nil then
               dbUpdates.on_duty = self.member.on_duty and 1 or 0
          end

          if next(dbUpdates) then
               local ok, err = pcall(function()
                    MySQL.update.await("UPDATE faction_members SET ? WHERE identifier = ? AND faction_name = ?", {
                         dbUpdates, self.playerIdentifier, self.faction.name
                    })
               end)
               success = ok

               if not ok then
                    Logger:Error(("[FactionMemberUpdater]: Failed to update `%s` in faction %s:"):format(
                         self.playerIdentifier,
                         self.faction.name
                    ), err)
                    return false, "sql_error", self.member
               end
          end
     end

     Logger:Debug(("[FactionMemberUpdater]:Apply()-> Applying changes:"), self.changes, dbUpdates)

     self.changes = {}

     local syncOk, syncErr = pcall(SyncFactionMembers, self.faction.id)

     if not syncOk then
          Logger:Error(("[FactionMemberUpdater]: Sync for faction %s"):format(self.faction.id), syncErr)
          return false, "sync_err", self.member
     end

     return success, errVal, self.member
end

return FactionMemberUpdater
