@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% add .
%GIT% status --porcelain > %TEMP%\git_status.txt
for /f "tokens=*" %%a in (%TEMP%\git_status.txt) do (
    %GIT% commit -m "Auto-sync: project code update"
    %GIT% push origin main
    goto :done
)
:done
