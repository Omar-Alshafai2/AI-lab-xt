@echo off
title CORTEXLAB
echo ========================================================
echo   CORTEXLAB - Starting Interactive AI Laboratory...
echo   Open: http://localhost:5173/
echo ========================================================
cd /d "%~dp0frontend"
npm run dev
pause
