@echo off
setlocal
set "REPO=%~dp0"
set "DOWNLOADS=%USERPROFILE%\Downloads"
set "TOOL=%REPO%tools\price-refresh.mjs"
set "REPORT=%REPO%audit-out\price-refresh-report.json"
set "IMPORT=%REPO%audit-out\price-refresh-import.json"

cls
echo ========================================
echo    SHELFCHECK PRICE REFRESH - REFINE
echo ========================================
echo.

if not exist "%REPORT%" (
  echo No existing full price report was found at:
  echo %REPORT%
  echo.
  echo Run Refresh ShelfCheck Prices.cmd first.
  echo.
  pause
  exit /b 1
)

echo Updating the v2 refresh tool from GitHub...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Invoke-WebRequest 'https://raw.githubusercontent.com/Blade1090/the-josh-set/main/tools/price-refresh.mjs' -OutFile '%TOOL%'"
if errorlevel 1 (
  echo Could not download the latest refresh tool.
  pause
  exit /b 1
)

echo.
echo Reusing the full scan you already finished.
echo This pass only revisits ambiguous/product-name cases and should be much faster.
echo.
cd /d "%REPO%"
node "%TOOL%" --reuse-report="%REPORT%"
if errorlevel 1 (
  echo.
  echo Refinement stopped with an error. Nothing was imported into ShelfCheck.
  pause
  exit /b 1
)

if exist "%IMPORT%" copy /Y "%IMPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-import.json" >nul
if exist "%REPORT%" copy /Y "%REPORT%" "%DOWNLOADS%\shelfcheck-price-refresh-report.json" >nul

echo.
echo ========================================
echo REFINEMENT FINISHED
echo ========================================
echo.
echo The new merge-safe import and refined report were copied to Downloads.
echo Do NOT import until the summary has been reviewed.
echo.
explorer "%DOWNLOADS%"
pause
