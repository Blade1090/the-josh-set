@echo off
setlocal
set "REPO=%~dp0"
set "DOWNLOADS=%USERPROFILE%\Downloads"
set "TOOL=%REPO%tools\price-refresh.mjs"
set "IMPORT=%REPO%audit-out\price-refresh-import.json"
set "REPORT=%REPO%audit-out\price-refresh-report.json"

cls
echo ========================================
echo      SHELFCHECK PRICE REFRESH
echo ========================================
echo.

for /f "delims=" %%F in ('powershell -NoProfile -Command "Get-ChildItem -LiteralPath ''%DOWNLOADS%'' -Filter ''shelfcheck-price-audit-*.json'' ^| Sort-Object LastWriteTime -Descending ^| Select-Object -First 1 -ExpandProperty FullName"') do set "AUDIT=%%F"

if not defined AUDIT (
  echo No ShelfCheck price audit found in:
  echo %DOWNLOADS%
  echo.
  echo Export one from ShelfCheck on your phone, then put it in Downloads.
  echo.
  pause
  exit /b 1
)

echo Found newest audit:
echo %AUDIT%
echo.
echo Updating the refresh tool from GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://raw.githubusercontent.com/Blade1090/the-josh-set/main/tools/price-refresh.mjs' -OutFile '%TOOL%'"
if errorlevel 1 (
  echo.
  echo Could not download the latest refresh tool.
  pause
  exit /b 1
)

echo.
echo Running price refresh. This takes a while because it checks PriceCharting carefully.
echo You can leave this window open and do other things.
echo.
cd /d "%REPO%"
node "%TOOL%" --audit="%AUDIT%"
if errorlevel 1 (
  echo.
  echo Refresh stopped with an error. Nothing was imported into ShelfCheck.
  pause
  exit /b 1
)

echo.
echo ========================================
echo REFRESH FINISHED
echo ========================================
echo Report:
echo %REPORT%
echo.
echo Import file:
echo %IMPORT%
echo.
if exist "%IMPORT%" copy /Y "%IMPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-import.json" >nul
if exist "%REPORT%" copy /Y "%REPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-report.json" >nul

echo Copies were also placed in Downloads for easy transfer back to your phone.
echo.
explorer "%DOWNLOADS%"
pause
