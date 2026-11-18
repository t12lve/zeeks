@echo off
rem Construit ZEEKS (toolchain Rust GNU + binutils MSYS2) et copie l'exe dans dist\
setlocal

if exist "C:\msys64\mingw64\bin\dlltool.exe" (
    set "PATH=C:\msys64\mingw64\bin;%PATH%"
) else (
    echo [!] binutils introuvables dans C:\msys64\mingw64\bin
    echo     winget install MSYS2.MSYS2
    echo     C:\msys64\usr\bin\bash.exe -lc "pacman -Sy --noconfirm mingw-w64-x86_64-binutils"
)

cargo +stable-x86_64-pc-windows-gnu build --release
if errorlevel 1 goto :error

if not exist dist mkdir dist
copy /y "target\release\zeeks.exe" "dist\zeeks.exe" >nul
echo.
echo OK -^> dist\zeeks.exe
goto :eof

:error
echo.
echo Echec de la compilation.
exit /b 1
