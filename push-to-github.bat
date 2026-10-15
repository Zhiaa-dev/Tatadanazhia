@echo off
setlocal enabledelayedexpansion

echo ========================================================
echo       TataDana - Push Repositori ke GitHub
echo ========================================================
echo.

set "GIT_EXE=C:\Users\anisa\.gemini\antigravity\scratch\bin\git\cmd\git.exe"

if not exist "!GIT_EXE!" (
    echo [ERROR] Git tidak ditemukan di !GIT_EXE!
    pause
    exit /b 1
)

echo Masukkan URL Repositori GitHub Anda:
echo (Contoh: https://github.com/username-anda/tatadana.git)
echo.
set /p REPO_URL="URL GitHub: "

if "!REPO_URL!"=="" (
    echo [ERROR] URL Repositori tidak boleh kosong.
    pause
    exit /b 1
)

echo.
echo [1/3] Menghapus remote origin lama (jika ada)...
"!GIT_EXE!" remote remove origin 2>nul

echo [2/3] Menghubungkan ke: !REPO_URL!...
"!GIT_EXE!" remote add origin "!REPO_URL!"

echo [3/3] Melakukan push ke branch main...
echo.
"!GIT_EXE!" push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo  BERHASIL! Kode TataDana telah ter-upload ke GitHub.
    echo  Sekarang buka https://vercel.com untuk Deploy 1-Klik!
    echo ========================================================
) else (
    echo.
    echo [CATATAN] Jika diminta login atau Personal Access Token,
    echo silakan masukkan kredensial akun GitHub Anda.
)

pause
