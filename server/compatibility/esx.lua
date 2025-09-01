local logPrefix <const> = "[ESX COMPAT] [%s]-> "

---@param factionId string
---@param factionData Faction
RegisterNetEvent('mate-factions:FactionCreated', function(factionId, factionData)
    MySQL.query("INSERT INTO jobs (name, label, whitelisted) VALUES (?, ?, 0)", {
        factionId, factionData.label
    }, function(res)
        Logger:Debug("[ESX COMPAT] [FactionCreated]-> Res:", res)

        if res.affectedRows > 0 then
            Logger:Info(("[ESX COMPAT] Faction `%s` added as job"):format(factionId))

            if factionData.ranks and #factionData.ranks > 0 then
                for i, rank in ipairs(factionData) do
                    MySQL.query.await(
                        "INSERT INTO job_grades (job_name, grade, name, label, salary) VALUES (?, ?, ?, ?, ?)", {
                            factionId, i - 1, rank.name, rank.name, 0
                        })
                end

                Logger:Info(("[ESX COMPAT]: Inserted %s jobs into `%s`"):format(#factionData.ranks, factionId))
            end
        else
            Logger:Error(("[ESX COMPAT]: Failed to insert faction %s into jobs"):format(factionId))
        end
    end)
end)

---@param playerIdentifier string
---@param factionId string
---@param faction Faction
RegisterNetEvent("mate-factions:PlayerFactionSet", function(playerIdentifier, factionId, faction)
    local xPlayer = ESX.GetPlayerFromIdentifier(playerIdentifier)
    local grade = 0

    if xPlayer then
        xPlayer.setJob(factionId, grade)
        Logger:Info(("%s `%s` job set to %s"):format(logPrefix, playerIdentifier, factionId))
    else
        local res = MySQL.query.await("UPDATE users SET job = ?, job_grade = ? WHERE identifier = ?", {
            factionId, grade, playerIdentifier
        })

        if res then
            Logger:Debug(("%s Response:"):format(logPrefix), res)

            if res.affectedRows > 0 then
                Logger:Info(("%s Updated offline player `%s` job to %s"):format(logPrefix, playerIdentifier, factionId))
            else
                Logger:Error(("%s Failed to update offline player `%s` job"):format(logPrefix, playerIdentifier))
            end
        end
    end
end)

---@param identifier string
---@param factionId string
RegisterNetEvent("mate-factions:MemberKickedFromFaction", function(identifier, factionId)
    local xPlayer = ESX.GetPlayerFromIdentifier(identifier)
    if xPlayer then
        xPlayer.setJob("unemployed", 0)
        Logger:Info(("%s `%s` has been kicked from %s"):format(logPrefix, identifier, factionId))
    else
        local res = MySQL.query.await("UPDATE users SET job = ?, job_grade = ? WHERE identifier = ?", {
            "unemployed",
            0, -- grade
            identifier
        })

        if res then
            Logger:Info(("%s `%s` has been offline kicked from %s"):format(logPrefix, identifier, factionId))
        end
    end
end)
