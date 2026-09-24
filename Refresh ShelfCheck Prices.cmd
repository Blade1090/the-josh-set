@echo off
setlocal
set "REPO=%~dp0"
set "DOWNLOADS=%USERPROFILE%\Downloads"
set "TOOL=%REPO%tools\price-refresh.mjs"
set "IMPORT=%REPO%audit-out\price-refresh-import.json"
set "REPORT=%REPO%audit-out\price-refresh-report.json"

cls
echo ========================================
echo      SHELFCHECK PRICE REFRESH v3
echo ========================================
echo.

for /f "delims=" %%F in ('powershell -NoProfile -Command "Get-ChildItem -LiteralPath ''%DOWNLOADS%'' -Filter ''shelfcheck-price-audit-*.json'' ^| Sort-Object LastWriteTime -Descending ^| Select-Object -First 1 -ExpandProperty FullName"') do set "AUDIT=%%F"

if not defined AUDIT (
  echo No ShelfCheck price audit found in:
  echo %DOWNLOADS%
  echo.
  echo In ShelfCheck: Menu ^> EXPORT PRICE AUDIT
  echo Then put that JSON file in Downloads and run this again.
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
if exist "%REPORT%" (
  echo Found your previous refresh report.
  echo v3 will reuse its exact PriceCharting routes instead of rediscovering every game.
) else (
  echo No previous route report found. This first run may be slower;
  echo later refreshes will reuse the report created today.
)
echo.
echo Checking current CIB values now...
echo Normal changes will be prepared automatically.
echo Big jumps and suspicious values are held for review and NOT imported.
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
echo.
echo Safe merge import:
echo %IMPORT%
echo.
echo Full review report:
echo %REPORT%
echo.
if exist "%IMPORT%" copy /Y "%IMPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-import.json" >nul
if exist "%REPORT%" copy /Y "%REPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-report.json" >nul

echo Both files were copied to Downloads.
echo Import ONLY shelfcheck-price-refresh-import.json into ShelfCheck.
echo The report is just for reviewing anything v3 refused to auto-accept.
echo.
explorer "%DOWNLOADS%"
pause
