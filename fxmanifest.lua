fx_version "cerulean"
game "gta5"
lua54 'yes'


author 'MateHUN [mhScripts]'
description 'Template used mCore'
version '1.0.0'


shared_scripts {
    "shared/**.*"
}

server_scripts {
    "server/helpers/*.lua",

    "server/core/main.lua",
    "server/core/init.lua",
    "server/core/faction.lua",

    "server/features/*.lua",
    "server/admin/*.lua",
    "server/compatibility/*.lua"
}

client_scripts {
    "client/functions.lua",
    "client/exports.lua",
    "client/main.lua",

    "client/features/*.lua"
}

server_script "@oxmysql/lib/MySQL.lua"
shared_script '@es_extended/imports.lua'
shared_script '@ox_lib/init.lua'

dependency {
    'mCore',
    'oxmysql',
    'ox_lib'
}


escrow_ignore {
    'shared/config.lua',
    '**/*.editable.lua'
}


files {
    "html/index.html",
    "html/assets/*.js",
    "html/assets/*.css"
}


-- ui_page "html/index.html"
ui_page "http://localhost:5173"
