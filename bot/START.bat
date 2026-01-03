@echo off
cd /d "%~dp0"
echo ========================================
echo DISCORD BOT - HAZIR!
echo ========================================
echo.
echo Firebase bilgileri eklendi!
echo.
echo [1/2] Bagimliliklar yukleniyor...
call npm install
echo.
echo [2/2] Bot baslatiliyor...
echo.
npm start
