

REM download du feed via bitsadmin
REM bitsadmin /reset
REM bitsadmin /create /download abc
REM bitsadmin /addfile abc "https://inreach.garmin.com/Feed/Share/ThierryBernier?d1=2017-07-14T00:00Z" feed.kml
REM bitsadmin /resume abc
REM bitsadmin /complete abc

REM Serveur HTTP local et download du feed
CD server
IF NOT EXIST ".\node_modules" npm install
START "Local HTTP Tiles server" /MIN  node server.js
TIMEOUT /T 3
CD ..

:browse
TIMEOUT /T 2
START "Browser" /B "C:\Program Files\Mozilla Firefox\firefox.exe" -new-tab "http://localhost:3000/map/"
TIMEOUT /T 2
START "Browser" /B "C:\Program Files\Mozilla Firefox\firefox.exe" -new-tab "http://localhost:3000/hikit/"
