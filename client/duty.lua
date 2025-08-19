local lang = Loc[Config.lan]

local panel = {
    visible = false,
    loading = false,
    factionType = false,

    setVisible = function(self, state, factionId, cpID)
        if self.loading then
            Error(lang.error["wait"])
        end

        self.visible = state and factionId or false
        SetNuiFocus(state, state)

        if self.visible then
            self.loading = true

            lib.callback("mate-factions:getDutyData", false, function(result)
                self.loading = false
                if result.err then
                    self:setVisible(false)
                    return Error(result.msg)
                end

                result.duty      = true
                result.page      = "DutyPanel"
                result.visible   = true
                result.onDuty    = LocalPlayer.state.factionDuty?.factionId == factionId
                result.cpID      = cpID
                self.factionType = result?.factionType

                sendNUI("DutyPage", result)
            end, factionId)
        else
            sendNUI("DutyPage", {
                duty = true,
                visible = false,
                page = "DutyPanel"
            })
        end
    end
}
panel.__index = panel

nuiCallback("exit", function(_, cb)
    panel:setVisible(false)
end)

nuiCallback("ToggleDuty", function(_, cb)
    sendNUI("close")
    panel:setVisible(false)
    -- TODO: ToggleDuty state
end)

local dutyMarkers = {}

local function addMarker(factionId, pos)
    local template = Config.DutyMarker
    template.id = "duty-" .. factionId
    template.pos = vec3(pos.x, pos.y, pos.z - 1)
    template.help = lang.info["duty_marker_help"]
    template.factionID = factionId
    -- TODO: Add Image to marker
    template.onInteract = (function()
        panel:setVisible(not panel.visible, factionId)
    end)

    dutyMarkers[tostring(factionId)] = true
    exports["mate-markers"]:AddMarker(template)

    print("Created duty marker for faction: " .. factionId .. " At: " .. json.encode(pos))
end


RegisterNetEvent("mate-factions:AddAllDutyMarker", function(markers)
    for factionId, data in pairs(markers) do
        if data.duty_point then
            addMarker(factionId, data.duty_point)
        end
    end
end)

RegisterNetEvent("mate-factions:AddDutyMarker", function(factionId, pos)
    addMarker(factionId, pos)
end)

RegisterNetEvent("mate-factions:moveDutyMarker", function(factionId, pos)
    exports["mate-markers"]:MoveMarker(("duty-%s"):format(factionId), pos)
end)


RegisterNetEvent("mate-factions:DutyPointUpdated", function(factionId, pos)
    if dutyMarkers[factionId] then
        exports["mate-markers"]:MoveMarker(("duty-%s"):format(factionId), pos)
    else
        addMarker(factionId, pos)
    end
end)
