@echo off
echo Pushing code to GitHub repository: https://github.com/qdev89/StellaRougeGame.git
echo =======================================================================

echo Setting up remote repository...
git remote remove origin
git remote add origin https://github.com/qdev89/StellaRougeGame.git

echo Verifying remote repository...
git remote -v

echo Pushing code to GitHub...
echo You may be prompted for your GitHub username and password/token.
echo If you have 2FA enabled, use a personal access token instead of your password.
echo =======================================================================

git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo Code successfully pushed to GitHub!
    echo Visit https://github.com/qdev89/StellaRougeGame to view your repository.
) else (
    echo Push failed with exit code: %ERRORLEVEL%
    echo Please try again or use GitHub Desktop to push your code.
)

echo Press any key to exit...
pause > nul
