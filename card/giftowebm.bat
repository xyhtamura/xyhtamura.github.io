@echo off
title GIF to WebM Converter
echo Starting conversion...
echo.

:NextFile
if "%~1"=="" goto Done

echo Converting: "%~1"
ffmpeg -i "%~1" -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p" -b:v 0 -crf 25 -vcodec libx264 "%~dpn1.mp4"

shift
goto NextFile

:Done
echo.
echo All files converted successfully!
pausef