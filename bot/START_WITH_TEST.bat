@echo off
echo ========================================
echo Firebase Baglanti Testi
echo ========================================
echo.

echo [1/2] Firebase baglantisi test ediliyor...
node test-firebase.js

if errorlevel 1 (
    echo.
    echo ========================================
    echo HATA: Firebase baglanamadi!
    echo ========================================
    echo.
    echo Lutfen .env dosyasini kontrol edin:
    echo - FIREBASE_PROJECT_ID
    echo - FIREBASE_PRIVATE_KEY
    echo - FIREBASE_CLIENT_EMAIL
    echo.
    echo Detayli bilgi icin SETUP_GUIDE.md dosyasina bakin
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [2/2] Bot baslatiliyor...
echo ========================================
echo.

npm start
