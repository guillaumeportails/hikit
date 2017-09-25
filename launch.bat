
CD server

IF NOT EXIST ".\node_modules" npm install

START "Local HTTP Tiles server" /MIN  node server.js
TIMEOUT /T 5

CD ..

START "Browser" /B "C:\Program Files\Mozilla Firefox\firefox.exe" -new-tab "index.html"
