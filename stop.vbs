' Cafe Manager - Stop Server
' Double-click this to stop the Cafe Manager server
' The PC will stay running

Dim shell, fso
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Kill only the Cafe Manager server process (the one listening on port 3001)
' This avoids killing other Node.js processes that might be running
shell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -ano ^| findstr :3001') do taskkill /f /pid %a", 0, True

WScript.Echo "✅ Cafe Manager Stopped"
