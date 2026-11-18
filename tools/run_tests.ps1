$ErrorActionPreference = "Continue"
$env:PATH = "C:\msys64\mingw64\bin;$env:PATH"
Set-Location (Split-Path -Parent $PSScriptRoot)
$exe = "target\release\audio2video.exe"
$probe = "target\release\spike.exe"
New-Item -ItemType Directory -Force out | Out-Null

function Convert-One($name, $audio, $vis, $ratio, $fit, $quality = "standard") {
    $mp4 = "out\$name.mp4"
    $log = "out\$name.log"
    if (Test-Path $mp4) { Remove-Item $mp4 -Force }
    $args = @("--convert", "--audio", $audio, "--visual", $vis, "--out", $mp4,
              "--format", $ratio, "--fit", $fit, "--quality", $quality, "--log", $log)
    $p = Start-Process -FilePath $exe -ArgumentList $args -PassThru -NoNewWindow
    $p.WaitForExit()
    $content = if (Test-Path $log) { Get-Content $log -Raw } else { "PAS DE LOG" }
    Write-Output ("{0,-20} exit={1} {2}" -f $name, $p.ExitCode, $content.Trim())
}

Convert-One "b_9x16_blur"   "tmp\test.wav" "tmp\paysage.jpg"  "9:16" "blur"
Convert-One "c_1x1_contain" "tmp\test.wav" "tmp\portrait.png" "1:1"  "contain"
Convert-One "d_gif_fill"    "tmp\test.wav" "tmp\anim.gif"     "9:16" "fill"
Convert-One "e_webp_blur"   "tmp\test.wav" "tmp\anim.webp"    "1:1"  "blur"
Convert-One "f_apng_fill"   "tmp\test.wav" "tmp\anim.png"     "16:9" "fill"
Convert-One "g_mp3"         "tmp\court.mp3" "tmp\carre.png"   "16:9" "fill"

Write-Output "--- extraction d'images ---"
& $probe "out\b_9x16_blur.mp4" 1.0 "out\b.png"
& $probe "out\c_1x1_contain.mp4" 1.0 "out\c.png"
& $probe "out\d_gif_fill.mp4" 0.2 "out\d_02.png"
& $probe "out\d_gif_fill.mp4" 1.1 "out\d_11.png"
& $probe "out\e_webp_blur.mp4" 1.0 "out\e.png"
& $probe "out\f_apng_fill.mp4" 0.3 "out\f_03.png"
& $probe "out\f_apng_fill.mp4" 1.2 "out\f_12.png"
& $probe "out\g_mp3.mp4" 0.5 "out\g.png"
