ESX   = exports['es_extended']:getSharedObject()
mCore = exports["mCore"]:getSharedObj()

lang = Loc[Config.lan]
local inv = exports["ox_inventory"]


            
            local visible = false
            
            local function sendNUI(action, data)
                 if type(data) ~= "table" then
                      data = {}
                 end
            
                 SendNUIMessage({
                      action = action,
                      data   = data
                 })
            end
            
            local function nuiCallback(name, callback)
                 RegisterNUICallback(name, function(data, cb)
                      print("nuiCallback:", name)
                      if not visible then
                           return cb("ok")
                      end
            
                      callback(data, cb)
                 end)
            end
            
            local function nuiServerCallback(name, otherParams)
                 nuiCallback(name, (function(params, cb)
                      print("serverCallback[Params]:", json.encode(params, { indent = true }))
                      lib.callback(("mate-factions:%s"):format(name), false, (function(result)
                           print("Result: ", json.encode(result, { indent = true }))
                           if result.msg and result.msgTyp ~= nil then
                                mCore.Notify(lang.Title, result.msg, result.msgTyp, 5000)
                           elseif result.msg then
                                mCore.Notify(lang.Title, result.msg, result.err and "error" or "info", 5000)
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
                 sendNUI("open")
                 visible = true
                 SetNuiFocus(true, true)
            end))
            -- RegisterKeyMapping("mate-factions", "Dashboard Open", "keyboard", "home")
            exports("Open", function(...)
                 ExecuteCommand("mate-factions")
            end)
            