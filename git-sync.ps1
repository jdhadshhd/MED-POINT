# Git Auto-Sync Script
# Automatically commits and pushes changes to GitHub

param(
    [string]$message = "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)

Write-Host "🔄 Starting Git Auto-Sync..." -ForegroundColor Cyan

# Check if there are changes
$status = git status --porcelain

if ($status) {
    Write-Host "📝 Changes detected, committing..." -ForegroundColor Yellow
    
    # Add all changes
    git add .
    
    # Commit with message
    git commit -m $message
    
    # Push to remote
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Green
    git push
    
    Write-Host "✅ Sync completed successfully!" -ForegroundColor Green
} else {
    Write-Host "✨ No changes to sync." -ForegroundColor Gray
}
