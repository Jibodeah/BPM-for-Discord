@echo off
REM Just run a powershell command.
SET ScriptDir=%~dp0
Set ScriptLocation=%ScriptDir%win_ps.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "& '%ScriptLocation%' -isPTB"
pause

