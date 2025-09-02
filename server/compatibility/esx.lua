if GetResourceState("es_extended") ~= "started" then return end

local logPrefix <const> = "[ESX COMPAT]-> "


---@param factionId string
---@param factionData Faction
RegisterNetEvent('mate-factions:FactionCreated', function(factionId, factionData)
    local grades = {}
    for rankId, rank in pairs(factionData.ranks) do
        table.insert(grades, {
            job_name    = factionId,
            grade       = rankId,
            name        = rank.name,
            label       = rank.name,
            salary      = 0,
            skin_male   = {},
            skin_female = {}
        })
    end

    local success = ESX.CreateJob(factionId, factionData.label, grades)

    if success then
        Logger:Info(("%s Faction Created successfull: %s"):format(logPrefix, factionId))
        ESX.RefreshJobs()
    end
end)

---@param playerIdentifier string
---@param factionId string
---@param faction Faction
RegisterNetEvent("mate-factions:PlayerFactionSet", function(playerIdentifier, factionId, faction)
    local xPlayer = ESX.GetPlayerFromIdentifier(playerIdentifier)
    local grade = 1

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
