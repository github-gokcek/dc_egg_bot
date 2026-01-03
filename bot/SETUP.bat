@echo off
echo ========================================
echo DC Egg Bot v2.0 - Dashboard-First
echo ========================================
echo.

echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js bulunamadi! Lutfen Node.js yukleyin.
    echo https://nodejs.org/
    pause
    exit /b 1
)
echo OK: Node.js bulundu
echo.

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Bagimliliklari yuklerken hata olustu!
    pause
    exit /b 1
)
echo OK: Bagimliliklar yuklendi
echo.

echo [3/4] Checking .env file...
if not exist .env (
    echo WARNING: .env dosyasi bulunamadi!
    echo .env.example dosyasindan kopyalaniyor...
    copy .env.example .env
    echo.
    echo ONEMLI: .env dosyasini duzenleyin ve bilgilerinizi girin!
    echo - Discord Token
    echo - Firebase Service Account
    echo.
    pause
)
echo OK: .env dosyasi mevcut
echo.

echo [4/4] Starting bot...
echo.
echo ========================================
echo Bot baslatiliyor...
echo ========================================
echo.

npm start
