

REM download du feed via bitsadmin
bitsadmin /reset
bitsadmin /create /download abc
bitsadmin /addfile abc "https://inreach.garmin.com/Feed/Share/ThierryBernier?d1=2017-07-14T00:00Z" feed.kml
bitsadmin /resume abc
bitsadmin /complete abc
goto browse

REM Serveur HTTP local et download du feed
CD server
IF NOT EXIST ".\node_modules" npm install
START "Local HTTP Tiles server" /MIN  node server.js
TIMEOUT /T 5
CD ..

:browse
START "Browser" /B "C:\Program Files\Mozilla Firefox\firefox.exe" -new-tab "index.html"
