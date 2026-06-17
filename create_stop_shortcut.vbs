' Create Desktop Shortcut for Stop Cafe Manager
' Run this once to put a "Stop Cafe Manager" shortcut on the desktop

Dim shell, fso, desktopPath, projectPath, shortcutPath
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get paths
desktopPath = shell.SpecialFolders("Desktop")
projectPath = fso.GetParentFolderName(WScript.ScriptFullName)
shortcutPath = fso.BuildPath(desktopPath, "Stop Cafe Manager.lnk")

' Create shortcut
Dim shortcut
Set shortcut = shell.CreateShortcut(shortcutPath)

' Point to stop.vbs
shortcut.TargetPath = fso.BuildPath(projectPath, "stop.vbs")
shortcut.WorkingDirectory = projectPath
shortcut.Description = "Double-click to stop the Cafe Manager server"
shortcut.IconLocation = fso.BuildPath(projectPath, "cafe-icon.ico")  ' Same coffee cup icon

shortcut.Save

WScript.Echo "✅ 'Stop Cafe Manager' shortcut created on your desktop."
WScript.Echo "Double-click it to stop the server."
