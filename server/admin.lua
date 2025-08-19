local lang = Loc[Config.lan]
local Logger = require("server.log")
RegisterCommand("createfaction", function(source, args, raw)
    if not Functions.IsAdmin(source) then
        Logger:Debug(("%s(%s) is not an admin Tried to use command: `createfaction`"):format(GetPlayerName(source),
            source))
        mCore.Notify(source, lang.Title, "error", lang.error["not_an_admin"], 5000)
        return
    end


    local name = args[1]
    local label = args[2]
    local type = args[3] or "job"

    if not name then
        Logger:Debug("[createfaction]: Missing arg: Name")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "NAME"), "error", 5000)
    end

    if not label then
        Logger:Debug("[createfaction]: Missing arg: Label")
        return mCore.Notify(source, lang.Title, string.format(lang.error["missing_arg"], "LABEL"), "error", 5000)
    end

    local success, errVal, handleErr = InsertFaction(name, label, type)

    if success then
        mCore.Notify(source, lang.Title, string.format(lang.success["faction_created"], name), "success", 5000)
    else
        handleErr(errVal, source)
    end
end)
