@echo off
cd /d "%~dp0"
echo ========================================
echo DISCORD BOT - FIREBASE TEST
echo ========================================
echo.
echo Calisma dizini: %CD%
echo.

echo [1/3] Firebase baglantisi test ediliyor...
echo.
node test-firebase.js
if errorlevel 1 (
    echo.
    echo HATA: Firebase baglanamadi!
    echo .env dosyasini kontrol edin
    pause
    exit /b 1
)

echo.
echo ========================================
echo [2/3] Firebase Listener test ediliyor...
echo ========================================
echo.
echo Yeni bir terminal acin ve su komutu calistirin:
echo   node create-test-match.js
echo.
echo Bu ekranda degisiklik gormelisiniz.
echo.
pause

echo.
echo ========================================
echo [3/3] Bot baslatiliyor...
echo ========================================
echo.
echo Bot baslatildiginda:
echo 1. "Firebase listener aktif!" mesajini goreceksiniz
echo 2. Dashboard'dan mac olusturun
echo 3. Console'da "YENI MAC ALGILANDI" mesajini goreceksiniz
echo 4. Discord'da bildirim gelecek
echo.
pause

npm start
