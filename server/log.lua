Logger = {}
Logger.__index = Logger


function Logger:Info(msg, ...)
    print(("[^2Factions^0] %s"):format(msg), ...)
end

function Logger:Error(msg, ...)
    print(("[^2Factions^0] [^1Err^0] %s"):format(msg), ...)
end

function Logger:Warning(msg, ...)
    print(("[^2Factions^0] [^4Warning^0] %s"):format(msg), ...)
end


return Logger
