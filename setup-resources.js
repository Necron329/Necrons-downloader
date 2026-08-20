import { execSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resourcesDir = join(__dirname, 'resources').replace(/\\/g, '/');

const psCommand = `
$r = '${resourcesDir}';
if (!(Test-Path $r)) { New-Item -ItemType Directory -Path $r | Out-Null };

# 1. Download yt-dlp nightly
Write-Host '1/2 Downloading yt-dlp nightly...' -ForegroundColor Cyan;
$ytdlpUrl = "https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/yt-dlp.exe";
Invoke-WebRequest -Uri $ytdlpUrl -OutFile (Join-Path $r 'yt-dlp.exe');

# 2. Download FFmpeg (Dynamic search for the latest Shared ZIP via GitHub API)
Write-Host '2/2 Searching and downloading FFmpeg Shared Build (including DLLs)...' -ForegroundColor Cyan;
$api = Invoke-RestMethod -Uri "https://api.github.com/repos/BtbN/FFmpeg-Builds/releases/latest";
$asset = $api.assets | Where-Object { $_.name -like "*win64-gpl-shared.zip" } | Select-Object -First 1;

if ($asset) {
    $ffmpegZip = Join-Path $r 'ff.zip';
    Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $ffmpegZip;
    
    Write-Host 'Extracting all files...' -ForegroundColor Cyan;
    $temp = Join-Path $r 'temp_ff';
    Expand-Archive -Path $ffmpegZip -DestinationPath $temp -Force;
    
    # Copy EVERYTHING from the bin folder (EXE and DLL files)
    Write-Host 'Moving binaries and DLLs to /resources...' -ForegroundColor Gray;
    Get-ChildItem -Path $temp -Recurse -Directory -Filter 'bin' | ForEach-Object { 
        Get-ChildItem -Path $_.FullName -File | Copy-Item -Destination $r -Force 
    };
    
    # Cleanup
    Remove-Item -Path $ffmpegZip -Force;
    Remove-Item -Path $temp -Recurse -Force;
} else {
    Write-Error 'Could not find a shared zip release on GitHub.';
}

Write-Host '--- SETUP SUCCESSFUL. Check the resources folder ---' -ForegroundColor Green;
`;

try {
    console.log("Starting setup... Please wait, downloading approximately 100MB of data.");
    const encodedCommand = Buffer.from(psCommand, 'utf16le').toString('base64');
    execSync(`powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedCommand}`, { stdio: 'inherit' });
} catch (error) {
    console.error("Critical Setup Error:", error.message);
}