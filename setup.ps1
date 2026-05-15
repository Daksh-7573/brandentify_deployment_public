# Brandentifier - Quick Setup Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Brandentifier - Quick Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "[ERROR] .env file not found!" -ForegroundColor Red
    Write-Host "The .env file should have been created. Please check the project directory." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if DATABASE_URL is configured
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "DATABASE_URL=postgresql://") {
    Write-Host "[WARNING] DATABASE_URL not configured in .env file" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please edit .env file and add your PostgreSQL connection string:" -ForegroundColor Yellow
    Write-Host "DATABASE_URL=postgresql://postgres:your_password@localhost:5432/brandentifier" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Do you want to continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
}

Write-Host "[1/4] Checking PostgreSQL installation..." -ForegroundColor Green
try {
    $pgVersion = psql --version
    Write-Host "[SUCCESS] PostgreSQL found: $pgVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[2/4] Checking if database exists..." -ForegroundColor Green

# Try to connect to database
$dbExists = $false
try {
    $result = psql -U postgres -d brandentifier -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dbExists = $true
        Write-Host "[SUCCESS] Database 'brandentifier' exists!" -ForegroundColor Green
    }
} catch {
    $dbExists = $false
}

if (-not $dbExists) {
    Write-Host "[INFO] Database 'brandentifier' not found. Creating it now..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please enter your PostgreSQL password when prompted:" -ForegroundColor Cyan
    
    try {
        psql -U postgres -c "CREATE DATABASE brandentifier;"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] Database created!" -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Failed to create database" -ForegroundColor Red
            Read-Host "Press Enter to exit"
            exit 1
        }
    } catch {
        Write-Host "[ERROR] Failed to create database: $_" -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
}

Write-Host ""
Write-Host "[3/4] Pushing database schema..." -ForegroundColor Green
Write-Host ""

npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "[ERROR] Failed to push database schema" -ForegroundColor Red
    Write-Host "Please check your DATABASE_URL in .env file" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/4] Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Windows compatibility: FIXED" -ForegroundColor Green
Write-Host "   (cross-env installed for environment variables)" -ForegroundColor Gray
Write-Host "" -ForegroundColor Cyan
Write-Host "Server will start on:" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:5001" -ForegroundColor White
Write-Host "- Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

npm run dev
