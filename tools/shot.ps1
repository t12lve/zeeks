param([string]$Out = "ui.png", [string]$Files = "", [int]$Wait = 5)

Add-Type -AssemblyName System.Drawing
# sans conscience DPI, GetWindowRect/PrintWindow sont virtualisés et rognent la capture
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Dpi { [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr ctx); }
"@ -ErrorAction SilentlyContinue
[void][Dpi]::SetProcessDpiAwarenessContext([IntPtr](-4))
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class PW {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
if ($Files -ne "") {
    $argList = $Files.Split("|")
    $p = Start-Process -FilePath "target\release\audio2video.exe" -ArgumentList $argList -PassThru
} else {
    $p = Start-Process -FilePath "target\release\audio2video.exe" -PassThru
}
Start-Sleep -Seconds $Wait
$p.Refresh()
if ($p.HasExited) { Write-Output "EXITED"; exit 1 }
$h = $p.MainWindowHandle
[void][PW]::ShowWindow($h, 5)
Start-Sleep -Milliseconds 1200

$r = New-Object PW+RECT
[void][PW]::GetWindowRect($h, [ref]$r)
$w = $r.Right - $r.Left
$hh = $r.Bottom - $r.Top
$bmp = New-Object System.Drawing.Bitmap($w, $hh)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$hdc = $g.GetHdc()
$ok = [PW]::PrintWindow($h, $hdc, 2)
$g.ReleaseHdc($hdc)
$g.Dispose()
$bmp.Save((Join-Path (Get-Location) $Out), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$p.Kill()
Write-Output "PrintWindow=$ok ${w}x${hh}"
