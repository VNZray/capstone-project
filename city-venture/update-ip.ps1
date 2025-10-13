# PowerShell script to update API URL with current IP address
# Run this script whenever your IP changes

$envFile = ".env"

# Get the first active IPv4 address (excluding loopback and APIPA)
$ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne $null -and $_.PrefixOrigin -ne "WellKnown"
    } |
    Select-Object -First 1
).IPAddress

if ($ip) {
    $newApiUrl = "EXPO_PUBLIC_API_URL=http://${ip}:3000/api"
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        if ($content -match "^EXPO_PUBLIC_API_URL=") {
            $newContent = $content -replace "EXPO_PUBLIC_API_URL=.*", $newApiUrl
        } else {
            $newContent = @($content) + $newApiUrl
        }
        $newContent | Set-Content $envFile
    } else {
        Set-Content -Path $envFile -Value $newApiUrl
    }
    Write-Host "✅ Updated API URL to: http://${ip}:3000/api" -ForegroundColor Green
    Write-Host "⚠️  Please restart your dev server for changes to take effect!" -ForegroundColor Yellow
} else {
    Write-Host "❌ Could not detect local IP address" -ForegroundColor Red
}
