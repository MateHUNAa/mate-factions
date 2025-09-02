AddStateBagChangeHandler("factionBadge", nil, function(bagName, key, value)
    if value and value.active then
        print(("Badge active: %s - %s"):format(value.faction, value.number))
    else
        print("Badge inactive")
    end
end)
