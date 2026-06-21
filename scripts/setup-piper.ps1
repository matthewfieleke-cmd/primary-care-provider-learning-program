# One-time setup: Piper Windows binary + Ryan (high) voice for Hands-Free audio generation.
# No pip required. Run from repo root:
#   powershell -ExecutionPolicy Bypass -File scripts/setup-piper.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PiperDir = Join-Path $Root "tools\piper"
$VoiceDir = Join-Path $PiperDir "voices"
$ZipPath = Join-Path $PiperDir "piper_windows_amd64.zip"
$PiperExe = Join-Path $PiperDir "piper\piper.exe"

New-Item -ItemType Directory -Force -Path $PiperDir, $VoiceDir | Out-Null

if (-not (Test-Path $PiperExe)) {
  Write-Host "Downloading Piper for Windows (~22 MB)..."
  curl.exe -L "https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_windows_amd64.zip" -o $ZipPath
  Expand-Archive -Path $ZipPath -DestinationPath $PiperDir -Force
  Write-Host "Piper installed:" $PiperExe
} else {
  Write-Host "Piper already installed:" $PiperExe
}

$ModelOnnx = Join-Path $VoiceDir "en_US-ryan-high.onnx"
$ModelJson = Join-Path $VoiceDir "en_US-ryan-high.onnx.json"

if (-not (Test-Path $ModelOnnx)) {
  Write-Host "Downloading Ryan (high) voice (~115 MB)..."
  curl.exe -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high/en_US-ryan-high.onnx" -o $ModelOnnx
  curl.exe -L "https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ryan/high/en_US-ryan-high.onnx.json" -o $ModelJson
} else {
  Write-Host "Ryan voice already present:" $ModelOnnx
}

Write-Host ""
Write-Host "Test synthesis..."
$TestWav = Join-Path $PiperDir "test-ryan.wav"
Push-Location (Split-Path $PiperExe)
"Hello. Hands free mode is ready." | & $PiperExe --model $ModelOnnx --config $ModelJson --output_file $TestWav
Pop-Location
if ($LASTEXITCODE -eq 0) {
  Write-Host "Success:" $TestWav
} else {
  Write-Error "Piper test failed."
}

Write-Host ""
Write-Host "Generate quiz audio (example):"
Write-Host "  node scripts/generate-handsfree-audio.js --ids 1"
Write-Host "  node scripts/generate-handsfree-audio.js --category 4"
