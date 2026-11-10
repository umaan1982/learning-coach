@echo off
rem Learning-coach web UI: one step to set up and start.
rem   start-ui.cmd           your real data (~/learning-coach-data)
rem   start-ui.cmd sandbox   throwaway practice data in the temp folder
rem Double-click works too. Runs through cmd.exe, so PowerShell's script policy doesn't matter.
setlocal
cd /d "%~dp0webui" || (echo Can't find the webui folder next to this file. & pause & exit /b 1)

where node >nul 2>nul || (
  echo Node.js is not installed or not on PATH. Install it from https://nodejs.org and try again.
  pause & exit /b 1
)

rem Install the packages on first run, and again whenever package-lock.json is newer than
rem the installed set (e.g. after a git pull that added packages).
node -e "const f=require('fs'),t=p=>{try{return f.statSync(p).mtimeMs}catch{return 0}};process.exit(t('package-lock.json')>t('node_modules/.package-lock.json')?1:0)"
if errorlevel 1 (
  echo Installing packages ^(about a minute^)...
  call npm.cmd install --no-fund --no-audit || (echo npm install failed. & pause & exit /b 1)
)

set MODE=
if /i "%~1"=="sandbox" set MODE=--sandbox

rem Run the server. After a crash (exit code 1) start it again by itself, without opening another
rem browser tab. Exit 0 = stopped normally or already running; 2 = a problem a restart can't fix.
rem Give up after 5 crashes so a broken setup doesn't loop forever. The log: server.log in
rem %USERPROFILE%\learning-coach-profiles (sandbox: next to the sandbox folder).
set OPEN=--open
if defined LC_NO_OPEN set OPEN=
set CRASHES=0
:run
node server\index.js %MODE% %OPEN%
set CODE=%errorlevel%
if "%CODE%"=="0" exit /b 0
if "%CODE%"=="2" (
  pause
  exit /b 2
)
set /a CRASHES+=1
if %CRASHES% GEQ 5 (
  echo The server stopped 5 times. See %USERPROFILE%\learning-coach-profiles\server.log
  pause
  exit /b 1
)
echo The server stopped unexpectedly ^(code %CODE%^). Restarting in 5 seconds... Close this window to stop.
timeout /t 5 /nobreak >nul
set OPEN=
goto run
