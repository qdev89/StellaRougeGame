# Stellar Rogue Game Server PowerShell Script

Write-Host "Stellar Rogue Game Server" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Attempting to start a local web server..." -ForegroundColor Yellow
Write-Host ""

# Check if Python is available
$pythonAvailable = $false

try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python") {
        $pythonAvailable = $true
        Write-Host "Python found: $pythonVersion" -ForegroundColor Green
        Write-Host ""
        Write-Host "Starting server..." -ForegroundColor Yellow
        Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
        Write-Host ""
        python -m http.server 8000
    }
}
catch {
    # Python not found, try python3
    try {
        $python3Version = python3 --version 2>&1
        if ($python3Version -match "Python") {
            $pythonAvailable = $true
            Write-Host "Python 3 found: $python3Version" -ForegroundColor Green
            Write-Host ""
            Write-Host "Starting server..." -ForegroundColor Yellow
            Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
            Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
            Write-Host ""
            python3 -m http.server 8000
        }
    }
    catch {
        # Python3 not found, try py
        try {
            $pyVersion = py --version 2>&1
            if ($pyVersion -match "Python") {
                $pythonAvailable = $true
                Write-Host "Python found: $pyVersion" -ForegroundColor Green
                Write-Host ""
                Write-Host "Starting server..." -ForegroundColor Yellow
                Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
                Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
                Write-Host ""
                py -m http.server 8000
            }
        }
        catch {
            # Py not found
        }
    }
}

# If Python is not available, try to use PowerShell's own HTTP server
if (-not $pythonAvailable) {
    Write-Host "Python was not found on your system." -ForegroundColor Red
    Write-Host ""
    Write-Host "Attempting to use PowerShell's HTTP server..." -ForegroundColor Yellow
    
    try {
        # Create a simple HTTP server using .NET
        $listener = New-Object System.Net.HttpListener
        $listener.Prefixes.Add("http://localhost:8000/")
        $listener.Start()
        
        Write-Host "PowerShell HTTP server started!" -ForegroundColor Green
        Write-Host "Open your browser and navigate to: http://localhost:8000" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the server when done." -ForegroundColor Yellow
        
        while ($listener.IsListening) {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response
            
            $localPath = $request.Url.LocalPath.TrimStart("/")
            if ($localPath -eq "") { $localPath = "index.html" }
            
            $filePath = Join-Path (Get-Location) $localPath
            
            if (Test-Path $filePath -PathType Leaf) {
                $content = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $content.Length
                $response.OutputStream.Write($content, 0, $content.Length)
            }
            else {
                $response.StatusCode = 404
            }
            
            $response.Close()
        }
    }
    catch {
        Write-Host "Failed to start PowerShell HTTP server: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please see README.html for other options to run the game." -ForegroundColor Yellow
        Start-Process "README.html"
    }
    finally {
        if ($listener -ne $null) {
            $listener.Stop()
        }
    }
}

Write-Host "Press any key to exit..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
