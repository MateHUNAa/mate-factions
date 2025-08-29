nuiServerCallback("requsetNearbyPlayers")
nuiServerCallback("inviteMember", function()
    sendNUI("close")
    SetNuiFocus(false, false)
end)


---@param factionData {label: string, factionId: string, from: {id: number,idf:string,name:string}}
lib.callback.register("mate-faction:inviteRequest", function(factionData)
    print("Invite request")
    local alert = lib.alertDialog({
        header = "Faction Invite",
        content = ("%s Invited you to %s"):format(factionData.from.name, factionData.label),
        centered = true,
        cancel = true
    })

    if alert == "confirm" then
        return true
    else
        return false
    end
end)
