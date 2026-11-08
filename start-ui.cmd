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

node server\index.js %MODE% --open
if errorlevel 1 pause
