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

rem First run (or after deleting webui\node_modules): install the packages.
if not exist node_modules\.package-lock.json (
  echo Installing packages ^(first run, about a minute^)...
  call npm.cmd install --no-fund --no-audit || (echo npm install failed. & pause & exit /b 1)
)

set MODE=
if /i "%~1"=="sandbox" set MODE=--sandbox

node server\index.js %MODE% --open
if errorlevel 1 pause
