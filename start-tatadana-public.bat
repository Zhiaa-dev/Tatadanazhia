@echo off
title TataDana - Server Semua Jaringan (Online Publik)
echo ========================================================
echo       MEMULAI TATADANA (AKSES SEMUA JARINGAN)
echo ========================================================
echo.

cd /d "%~dp0"

echo 1. Memeriksa executable cloudflared...
set CLOUDFLARED=..\bin\cloudflared.exe
if not exist "%CLOUDFLARED%" (
    set CLOUDFLARED=cloudflared.exe
)

echo 2. Menjalankan server TataDana di background...
start /b cmd /c "npm run dev"

timeout /t 5 /nobreak >nul

echo 3. Menghubungkan ke jaringan publik Cloudflare...
start /b cmd /c "%CLOUDFLARED% tunnel --url http://127.0.0.1:3000 --logfile ..\tunnel.log"

timeout /t 8 /nobreak >nul

echo.
echo ========================================================
echo   SERVER AKTIF! Silakan periksa link publik di bawah:
echo ========================================================
powershell -Command "$content = Get-Content '..\tunnel.log' -Raw; if ($content -match 'https://[a-zA-Z0-9-]+\.trycloudflare\.com') { Write-Host 'Tautan Publik (Bisa di Semua Jaringan / Kuota HP):' -ForegroundColor Green; Write-Host $matches[0] -ForegroundColor Yellow } else { Write-Host 'Tunnel sedang menghubungkan...' }"
echo.
echo Tautan Lokal (Laptop ini): http://localhost:3000
echo.
echo Tekan sembarang tombol untuk keluar dari jendela ini...
pause >nul
