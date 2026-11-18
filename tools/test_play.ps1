param([string]$Audio = "tmp\test.wav", [int]$Wait = 4)

Add-Type -AssemblyName System.Drawing
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class K2 {
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool GetClientRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool ClientToScreen(IntPtr h, ref POINT p);
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr hdc, uint flags);
  [DllImport("user32.dll")] public static extern bool PostMessage(IntPtr h, uint msg, IntPtr w, IntPtr l);
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int c);
  [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr ctx);
  public struct RECT { public int Left, Top, Right, Bottom; }
  public struct POINT { public int X, Y; }
}
"@
[void][K2]::SetProcessDpiAwarenessContext([IntPtr](-4))

$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
$p = Start-Process -FilePath "target\release\audio2video.exe" -ArgumentList @($Audio) -PassThru
Start-Sleep -Seconds $Wait
$p.Refresh()
if ($p.HasExited) { Write-Output "EXITED"; exit 1 }
$h = $p.MainWindowHandle
[void][K2]::ShowWindow($h, 5)
[void][K2]::SetForegroundWindow($h)
Start-Sleep -Milliseconds 800

$wr = New-Object K2+RECT; [void][K2]::GetWindowRect($h, [ref]$wr)
$cr = New-Object K2+RECT; [void][K2]::GetClientRect($h, [ref]$cr)
$origin = New-Object K2+POINT; [void][K2]::ClientToScreen($h, [ref]$origin)
# décalage client -> fenêtre (pour convertir les coordonnées de la capture)
$offX = $origin.X - $wr.Left
$offY = $origin.Y - $wr.Top

function Shot($name) {
    $w = $wr.Right - $wr.Left; $hh = $wr.Bottom - $wr.Top
    $bmp = New-Object System.Drawing.Bitmap($w, $hh)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $hdc = $g.GetHdc(); [void][K2]::PrintWindow($h, $hdc, 2); $g.ReleaseHdc($hdc); $g.Dispose()
    $bmp.Save((Join-Path (Get-Location) $name), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

function Space() {
    [void][K2]::PostMessage($h, 0x0100, [IntPtr]0x20, [IntPtr]0x00110001)
    Start-Sleep -Milliseconds 60
    [void][K2]::PostMessage($h, 0x0101, [IntPtr]0x20, [IntPtr]0xC0110001)
}

function ClickAt($x, $y) {
    $lp = [IntPtr](($y -shl 16) -bor $x)
    [void][K2]::PostMessage($h, 0x0200, [IntPtr]0, $lp)   # WM_MOUSEMOVE
    Start-Sleep -Milliseconds 120
    [void][K2]::PostMessage($h, 0x0200, [IntPtr]0, $lp)
    Start-Sleep -Milliseconds 120
    [void][K2]::PostMessage($h, 0x0201, [IntPtr]1, $lp)   # WM_LBUTTONDOWN (MK_LBUTTON)
    Start-Sleep -Milliseconds 120
    [void][K2]::PostMessage($h, 0x0202, [IntPtr]0, $lp)   # WM_LBUTTONUP
    Start-Sleep -Milliseconds 200
}

Write-Output "client=$($cr.Right)x$($cr.Bottom) offset=$offX,$offY"

Shot "t1_start.png"
Space
Start-Sleep -Milliseconds 2200
Shot "t2_playing.png"
Space
Start-Sleep -Milliseconds 400
Shot "t3_paused.png"
Space
Start-Sleep -Milliseconds 1600
Shot "t4_resumed.png"
# clic sur la barre à ~80 %
$barLeft = 130 - $offX; $barRight = 680 - $offX; $barY = 318 - $offY
ClickAt ([int]($barLeft + 0.8 * ($barRight - $barLeft))) $barY
Start-Sleep -Milliseconds 700
Shot "t5_seek80.png"
$p.Kill()
Write-Output "ok"
