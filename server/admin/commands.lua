local lang = Loc[Config.lan]
local Logger = require("shared.Logger")


RegisterCommand("makefaction", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `makefaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, lang.error["not_an_admin"], "error", 5000)
        return
    end


    local name  = args[1]
    local label = args[2]
    local type  = args[3] or "job"

    if not name then
        Logger:Debug("[makefaction]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "NAME"), "error", 5000)
    end

    if not label then
        Logger:Debug("[makefaction]: Missing arg: Label")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "LABEL"), "error", 5000)
    end

    local success, errVal, handleErr = InsertFaction(name, label, type)

    if success then
        mCore.Notify(source, lang.Title, string.format(lang.success["faction_created"], name), "success", 5000)
    else
        handleErr(errVal, source)
    end
end)


RegisterCommand("setfaction", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `setfaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, "error", lang.error["not_an_admin"], 5000)
        return
    end

    local target     = args[1]
    local factionId  = args[2]
    local removeFlag = tonumber(args[3]) or 0

    if not target then
        Logger:Debug("[setfaction]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "Target Player Id"), "error",
            5000)
    end

    if not factionId then
        Logger:Debug("[setfaction]: Missing arg: Label")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "Faction Id"), "error", 5000)
    end

    local targetPlayer = mCore.getPlayer(source)
    if not targetPlayer then
        return mCore.Notify(source, lang.Title, lang.error["player_missing"], "error", 5000)
    end

    if removeFlag == 1 then
        local s = kickFactionMember(targetPlayer.identifier, factionId)
        if s then
            mCore.Notify(source, lang.Title, string.format(lang.success["faction_set2"], targetPlayer.Name, factionId),
                "success", 5000)
            mCore.Notify(target, lang.Title, string.format(lang.info["faction_set2"], factionId), "info", 5000)
        else
            mCore.Notify(source, lang.Title, string.format(lang.error["faction_set2"], targetPlayer.Name, factionId),
                "success", 5000)
        end
        return
    end

    local success, errVal, handleErr = SetPlayerFaction(targetPlayer.identifier, factionId)

    if success then
        mCore.Notify(source, lang.Title, string.format(lang.success["faction_set"], targetPlayer.Name, factionId),
            "success", 5000)

        mCore.Notify(target, lang.Title, string.format(lang.info["faction_set"], factionId), "info", 5000)
    else
        handleErr(errVal, source)
    end
end)


RegisterCommand("setfactionleader", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `setfaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, "error", lang.error["not_an_admin"], 5000)
        return
    end

    local targetId  = args[1]
    local factionId = args[2]
    local isLeader  = tonumber(args[3])

    if not targetId then
        Logger:Debug("[setfactionleader]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "Target Player Id"), "error",
            5000)
    end

    if not factionId then
        Logger:Debug("[setfactionleader]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "factionId"), "error",
            5000)
    end

    if not isLeader then
        Logger:Debug("[setfactionleader]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "isLeader"), "error",
            5000)
    end

    local targetPlayer = mCore.getPlayer(tonumber(targetId))
    if not targetPlayer then
        return mCore.Notify(source, lang.Title, lang.error["player_missing"], "error", 5000)
    end

    local success, errVal, handleErr = SetFactionLeader(targetPlayer.identifier, factionId, isLeader)

    if success then
        mCore.Notify(source, lang.Title,
            string.format(lang.success["faction_leader_set"], targetPlayer.Name, factionId, isLeader),
            "success", 5000)

        mCore.Notify(targetId, lang.Title, string.format(lang.info["faction_leader_set"], factionId, isLeader), "info",
            5000)
    else
        handleErr(errVal, source)
    end
end)


RegisterCommand("createduty", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `setfaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, "error", lang.error["not_an_admin"], 5000)
        return
    end

    local factionId = args[1]

    local adminPed = GetPlayerPed(source)

    local coords = GetEntityCoords(adminPed)
    local heading = GetEntityHeading(adminPed)

    local dutyData = vec4(coords.x, coords.y, coords.z, heading)

    if not Factions[factionId] then return end

    local ok, err = pcall(function(...)
        MySQL.update.await([[
            UPDATE factions
            SET duty_point = ?
            WHERE name = ?
        ]], {
            json.encode(dutyData),
            factionId
        })
    end)

    if ok then
        Factions[factionId].duty_point = dutyData
        mCore.Notify(source, lang.Title, string.format(lang.success["duty_point_set"], factionId), "success", 5000)
        TriggerClientEvent("mate-factions:DutyPointUpdated", -1, factionId, dutyData)
    else
        mCore.Notify(source, lang.Title, lang.error["duty_point_set"], "error", 5000)
        Logger:Error("[createduty]:", err)
    end
end)


RegisterCommand("createstash", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `setfaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, "error", lang.error["not_an_admin"], 5000)
        return
    end

    local factionId = args[1]

    if not factionId then
        Logger:Debug("[setfactionleader]: Missing arg: factionId")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "factionId"), "error",
            5000)
    end

    local adminPed = GetPlayerPed(source)
    local adminPos = GetEntityCoords(adminPed)

    local affectedRows = MySQL.update.await("UPDATE factions SET stash = ? WHERE name = ?", {
        json.encode(adminPos),
        factionId
    })

    if affectedRows > 0 then
        mCore.Notify(source, lang.Title, string.format(lang.success["stash_placed"], factionId), "success", 5000)
        RegisterStash(Factions[factionId], adminPos)
        Factions[factionId].stash = adminPos

        TriggerClientEvent("mate-fations:UpdateStash", -1, factionId, adminPos)
    else
        mCore.Notify(source, lang.Title, lang.error["stash_place_failed"], "error", 5000)
    end
end)
