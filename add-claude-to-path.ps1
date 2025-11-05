# Add Claude CLI to PATH permanently
# Run this with: powershell -ExecutionPolicy Bypass -File add-claude-to-path.ps1

$claudePath = "C:\Users\karthik\.local\bin"

# Get current user PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")

# Check if already in PATH
if ($currentPath -like "*$claudePath*") {
    Write-Host "✅ Claude CLI path already exists in PATH" -ForegroundColor Green
} else {
    # Add to PATH
    $newPath = "$currentPath;$claudePath"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host "✅ Added Claude CLI to PATH successfully!" -ForegroundColor Green
    Write-Host "⚠️  Please restart your terminal/PowerShell for changes to take effect" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Current PATH includes:" -ForegroundColor Cyan
Write-Host $claudePath -ForegroundColor White
Write-Host ""
Write-Host "After restarting terminal, test with:" -ForegroundColor Cyan
Write-Host "  claude --version" -ForegroundColor White
