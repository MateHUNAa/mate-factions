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

                result.duty = true
                result.visible = true
                result.onDuty = LocalPlayer.state.factionDuty?.factionId == factionId
                result.cpID = cpID
                self.factionType = result?.factionType

                sendNUI("open", result)
            end, factionId)
        else
            sendNUI("open", {
                duty = true,
                visible = false
            })
        end
    end
}
panel.__index = panel



local function addMarker(factionId, pos)
    local template = Config.DutyMarker
    template.id = ("duty-%"):format(factionId)
    template.pos = pos
    template.help = lang.info["duty_marker_help"]
    template.factionID = factionId
    -- TODO: Add Image to marker
    template.onInteract = (function()
        -- Show duty panel
        print("factionId show panel!")
    end)

    exports["mate-markers"]:addMarker(template)
end
