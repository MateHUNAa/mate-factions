local isRendering = false

local function render(stashes)
    if isRendering then
        isRendering = false
        Info(lang.info["stash_render_off"])
        return
    end

    Info(lang.info["stash_render_on"])
    isRendering = true

    Citizen.CreateThread((function()
        while isRendering do
            for dbID, data in pairs(stashes) do
                mCore.Draw3DText(data.pos.x, data.pos.y, data.pos.z + 1,
                    ("ID: %s\nFaction:%s"):format(dbID, data.factionLabel), nil, nil, nil, true, 4)
            end

            Wait(1)
        end
    end))
end
RegisterNetEvent("mate-factions:toggleStashRender", render)
