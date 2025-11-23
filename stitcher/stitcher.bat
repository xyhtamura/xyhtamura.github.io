@echo off
setlocal enabledelayedexpansion

:: --- If no files were dropped, show instructions ---
if "%~1"=="" (
    echo Drag and drop files or folders onto this script to concatenate them.
    echo A dialog will ask for an output file name.
    echo.
    pause
    goto :eof
)

:: ---- Prompt user for desired output filename using a popup dialog ---
for /f "delims=" %%A in (
    'mshta "javascript:var n=prompt('Enter output name (no extension):','combined_text');if(n){new ActiveXObject('Scripting.FileSystemObject').GetStandardStream(1).Write(n);}close();"'
) do set "filename=%%A"

:: Default name fallback
if "%filename%"=="" set filename=combined_text

:: Normalize and remove spaces
set filename=%filename: =_%

:: Output directory = folder of first dropped item
set "OUTDIR=%~dp1"

:: Full path of intended output file
set "OUTFILE=%OUTDIR%%filename%.txt"

:: --- Auto-increment output name if file exists ---
set counter=1
:check_exists
if exist "%OUTFILE%" (
    set "OUTFILE=%OUTDIR%%filename%_!counter!.txt"
    set /a counter+=1
    goto check_exists
)

echo Creating: "%OUTFILE%"
echo.

:: ---- Process each dropped item (file or folder) ----
for %%I in (%*) do (
    if exist "%%~I\" (
        echo Processing folder: %%~nxI
        call :process_folder "%%~I"
    ) else (
        call :process_file "%%~I"
    )
)

echo.
echo Done!
echo Output file:
echo "%OUTFILE%"
echo.
pause
endlocal
goto :eof

:: ---- Subroutine to process a single file ----
:process_file
set "filepath=%~1"
echo   Adding: %~nx1

echo ========= BEGIN FILE: %~nx1 =========>>"%OUTFILE%"
echo [FULL PATH: %~f1]>>"%OUTFILE%"
echo.>>"%OUTFILE%"

type "%filepath%" >> "%OUTFILE%" 2>nul

echo.>>"%OUTFILE%"
echo ========= END FILE: %~nx1 =========>>"%OUTFILE%"
echo.>>"%OUTFILE%"
goto :eof

:: ---- Subroutine to recursively process all files in a folder ----
:process_folder
set "folderpath=%~1"
for /r "%folderpath%" %%F in (*) do (
    call :process_file "%%F"
)
goto :eof