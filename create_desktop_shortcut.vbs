' Create Desktop Shortcut for Cafe Manager
' Run this once to put a shortcut on the desktop

Dim shell, fso, desktopPath, projectPath, shortcutPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get paths
desktopPath = shell.SpecialFolders("Desktop")
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
shortcutPath = desktopPath & "\Cafe Manager.lnk"

' Create shortcut
Dim shortcut
Set shortcut = shell.CreateShortcut(shortcutPath)

' Point to start.vbs
shortcut.TargetPath = fso.BuildPath(projectPath, "start.vbs")
shortcut.WorkingDirectory = projectPath
shortcut.Description = "Double-click to start the Cafe Manager system"
shortcut.IconLocation = fso.BuildPath(projectPath, "cafe-icon.ico")  ' Custom coffee cup icon

shortcut.Save

WScript.Echo "✅ Desktop shortcut created at:" & vbCrLf & shortcutPath
WScript.Echo "Double-click 'Cafe Manager' on your desktop to start."
