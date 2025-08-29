ESX          = exports['es_extended']:getSharedObject()
mCore        = exports["mCore"]:getSharedObj()
local Logger = require("shared.Logger")
local lang   = Loc[Config.lan]
local inv    = exports["ox_inventory"]

function sendNUI(action, data)
  if type(data) ~= "table" then
    data = {}
  end

  SendNUIMessage({
    action = action,
    data   = data
  })
end

local timeouts = {}
local cooldown = 500

function nuiCallback(name, callback)
  RegisterNUICallback(name, function(data, cb)
    -- local now = GetGameTimer()
    -- local last = timeouts[name] or 0

    -- if now - last < cooldown then
    --   cb({ error = "cooldown" })
    --   Logger:Error(("[%s] is on cooldown !"):format(name))
    --   return
    -- end

    -- timeouts[name] = now
    callback(data, cb)
  end)
end

function nuiServerCallback(name, otherParams)
  nuiCallback(name, (function(params, cb)
    -- print("serverCallback[Params]:", json.encode(params, { indent = true }))
    lib.callback(("mate-factions:%s"):format(name), false, (function(result)
      -- print(("Result(%s): "):format(name), json.encode(result, { indent = true }))

      local ok, err = pcall(function(...)
        if result.msg and result.msgTyp ~= nil then
          mCore.Notify(lang.Title, result.msg, result.msgTyp, 5000)
        elseif result.msg then
          mCore.Notify(lang.Title, result.msg, result.err and "error" or "info", 5000)
        end
      end)

      if not ok then
        Logger:Error(("[%s]"):format(name), err)
      end

      cb(result)
    end), params, otherParams and otherParams())
  end))
end

nuiCallback("exit", (function(_, cb)
  visible = false
  SetNuiFocus(false, false)
  cb("ok")
end))

exports("Close", function(...)
  visible = false
  SetNuiFocus(false, false)
  sendNUI("close")
end)

RegisterCommand("mate-factions", (function(src, args, raw)
  local localPlayer = lib.callback.await("mate-factions:GetLocalPlayer", false)

  if not localPlayer then
    Logger:Error("Failed to fetch localPlayer !")
    return
  end

  sendNUI("open", {
    localPlayer    = localPlayer,
    ranks          = getFactionRanks(),
    permissions    = Config.PermissionList,
    playerFactions = localPlayer.factions
  })

  visible = true
  SetNuiFocus(true, true)
end))

-- RegisterKeyMapping("mate-factions", "Dashboard Open", "keyboard", "home")
exports("Open", function(...)
  ExecuteCommand("mate-factions")
end)


nuiServerCallback("requestLocalUser")
nuiServerCallback("requestFactionMembers")
nuiServerCallback("createRank", function()
  Wait(150)
  sendNUI("updateRanks", {
    permissions = Config.PermissionList,
    ranks = getFactionRanks()
  })
end)
nuiServerCallback("removeRank")
nuiServerCallback("updateFactionMember", (function()
  TriggerServerEvent("mate-factions:updatePlayerFaction")
end))
nuiServerCallback("requestPlayerFactions")
nuiServerCallback("requestNews")
nuiServerCallback("updateFactionRank")
nuiServerCallback("requestFactionRanks")

nuiServerCallback("promoteFactionMember")
nuiServerCallback("demoteFactionMember")
nuiServerCallback("kickFactionMember")



Citizen.CreateThread((function()
  while not ESX.IsPlayerLoaded() do
    Wait(250)
  end
  Logger:Info("Player is loaded successfully !")

  TriggerServerEvent("mate-factions:updatePlayerFaction")
end))





-- Command suggestions
local function addSuggestions()
  TriggerEvent('chat:addSuggestion', '/showfactions', 'Frakciók listázása')

  --   local types = ''
  --   for key, typ in pairs(FTYPES) do
  --     types = types .. ('%s - %s, '):format(key, typ.label)
  --   end

  TriggerEvent('chat:addSuggestion', '/makefaction', 'Frakció létrehozása', {
    { name = "name",  help = 'Név' },
    { name = "label", help = 'Label' },
    { name = "typ",   help = ("Típus (%s)"):format("maffia, gang, job") },
  })

  TriggerEvent('chat:addSuggestion', '/setfaction', 'Játékos frakcióba rakása', {
    { name = "ID",         help = 'Játékos ID' },
    { name = "factionID",  help = 'Frakció ID' },
    { name = "removeFlag", help = 'Remove (0 - Nem, 1 - Igen)', optional = true },
  })

  TriggerEvent('chat:addSuggestion', '/setfactionleader', 'Játékos leader jog állítás', {
    { name = "ID",        help = 'Játékos ID' },
    { name = "factionID", help = 'Frakció ID' },
    { name = "leader",    help = 'Leader (0 - Nem, 1 - Leader, 2 - Sub-Leader)' },
  })

  TriggerEvent('chat:addSuggestion', '/createduty', 'Frakció duty létrehozása', {
    { name = "factionID", help = 'Frakció ID' },
  })

  TriggerEvent('chat:addSuggestion', '/createstash', 'Frakció tároló létrehozása', {
    { name = "factionID", help = 'Frakció ID' },
  })

  TriggerEvent('chat:addSuggestion', '/showstashes', 'Tárolók megjelenítése')

  TriggerEvent('chat:addSuggestion', '/deletestash', 'Frakció tároló törlése', {
    { name = "factionID", help = 'Tároló ID' },
  })
end
SetTimeout(1000, addSuggestions)

AddEventHandler("onResourceStart", function(resourceName)
  if resourceName == "chat" then
    SetTimeout(1000, addSuggestions)
  end
end)
