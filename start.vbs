' Cafe Manager - Silent Launcher
' Double-click this file to start the server and open the browser
' No terminal window will appear

Dim shell, fso, projectPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)

' Start the backend server silently
shell.Run "node backend/server.js", 0, False

' Wait for the server to start (check health endpoint)
Dim http, started
started = False
For i = 1 To 10
  WScript.Sleep 1000
  On Error Resume Next
  Set http = CreateObject("MSXML2.ServerXMLHTTP")
  http.open "GET", "http://localhost:3001/api/health", False
  http.send ""
  If http.Status = 200 Then
    started = True
    Exit For
  End If
  On Error GoTo 0
Next

' Open the browser to the app
shell.Run "http://localhost:3001"
