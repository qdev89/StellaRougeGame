# PowerShell script to push code to GitHub
Write-Host "Pushing code to GitHub repository: https://github.com/qdev89/StellaRougeGame.git" -ForegroundColor Cyan
Write-Host "=======================================================================" -ForegroundColor Cyan

# Ensure the remote is set correctly
Write-Host "Setting up remote repository..." -ForegroundColor Yellow
git remote remove origin
git remote add origin https://github.com/qdev89/StellaRougeGame.git

# Verify remote
Write-Host "Verifying remote repository..." -ForegroundColor Yellow
git remote -v

# Push to GitHub
Write-Host "Pushing code to GitHub..." -ForegroundColor Yellow
Write-Host "You may be prompted for your GitHub username and password/token." -ForegroundColor Yellow
Write-Host "If you have 2FA enabled, use a personal access token instead of your password." -ForegroundColor Yellow
Write-Host "=======================================================================" -ForegroundColor Cyan

git push -u origin master

# Check if push was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Code successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "Visit https://github.com/qdev89/StellaRougeGame to view your repository." -ForegroundColor Green
} else {
    Write-Host "Push failed with exit code: $LASTEXITCODE" -ForegroundColor Red
    Write-Host "Please try again or use GitHub Desktop to push your code." -ForegroundColor Red
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
