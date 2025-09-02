if GetResourceState("qb-core") ~= "started" then return end

local QBCore = exports['qb-core']:GetCoreObject()
local logPrefix <const> = "[QB COMPAT]-> "

---@param factionId string
---@param factionData Faction
RegisterNetEvent('mate-factions:FactionCreated', function(factionId, factionData)
    local grades = {}

    for rankId, rank in pairs(factionData.ranks) do
        grades[tonumber(rankId)] = {
            name = rank.name,
            payment = 0
        }
    end

    QBCore.Shared.Jobs[factionId] = {
        label = factionData.label,
        defaultDuty = true,
        offDutyPay = false,
        grades = grades
    }

    Logger:Info(("%s Faction created successfully: %s"):format(logPrefix, factionId))
end)

---@param playerIdentifier string
---@param factionId string
---@param faction Faction
RegisterNetEvent("mate-factions:PlayerFactionSet", function(playerIdentifier, factionId, faction)
    local Player = QBCore.Functions.GetPlayerByCitizenId(playerIdentifier)
    local grade = 0

    if Player then
        Player.Functions.SetJob(factionId, grade)
        Logger:Info(("%s `%s` job set to %s"):format(logPrefix, playerIdentifier, factionId))
    else
        local res = MySQL.query.await("UPDATE players SET job = ? WHERE citizenid = ?", {
            json.encode({
                name = factionId,
                label = faction.label,
                grade = grade,
                onduty = true,
                payment = 0,
                isboss = false
            }),
            playerIdentifier
        })

        if res and res.affectedRows > 0 then
            Logger:Info(("%s Updated offline player `%s` job to %s"):format(logPrefix, playerIdentifier, factionId))
        else
            Logger:Error(("%s Failed to update offline player `%s` job"):format(logPrefix, playerIdentifier))
        end
    end
end)

---@param identifier string
---@param factionId string
RegisterNetEvent("mate-factions:MemberKickedFromFaction", function(identifier, factionId)
    local Player = QBCore.Functions.GetPlayerByCitizenId(identifier)

    if Player then
        Player.Functions.SetJob("unemployed", 0)
        Logger:Info(("%s `%s` has been kicked from %s"):format(logPrefix, identifier, factionId))
    else
        local res = MySQL.query.await("UPDATE players SET job = ? WHERE citizenid = ?", {
            json.encode({
                name = "unemployed",
                label = "Civilian",
                grade = 0,
                onduty = true,
                payment = 0,
                isboss = false
            }),
            identifier
        })

        if res and res.affectedRows > 0 then
            Logger:Info(("%s `%s` has been offline kicked from %s"):format(logPrefix, identifier, factionId))
        else
            Logger:Error(("%s Failed to offline kick `%s` from %s"):format(logPrefix, identifier, factionId))
        end
    end
end)

RegisterNetEvent('QBCore:Server:OnJobUpdate', function(jobData)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end

    local identifier = Player.PlayerData.citizenid

    SetPlayerFaction(identifier, jobData.name)
end)
