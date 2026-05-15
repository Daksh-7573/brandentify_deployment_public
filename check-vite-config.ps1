# Vite JSX File Naming Verification - Quick Check
# Run this to verify your JSX files have correct extensions

Write-Host "Checking Vite JSX Configuration..." -ForegroundColor Cyan
Write-Host ""

$issues = $false

# Check 1: .js files in components (should be .jsx or .tsx)
$jsFiles = Get-ChildItem -Path "client/src/components" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.jsx" }
if ($jsFiles) {
    Write-Host "Issue 1: Found .js files in components (should be .jsx):" -ForegroundColor Red
    $jsFiles | ForEach-Object { Write-Host "  - Rename: $($_.Name)" }
    $issues = $true
}

# Check 2: React plugin installed
$pluginExists = Test-Path "node_modules/@vitejs/plugin-react" -ErrorAction SilentlyContinue
if ($pluginExists) {
    Write-Host "OK: @vitejs/plugin-react is installed" -ForegroundColor Green
} else {
    Write-Host "Issue 2: @vitejs/plugin-react not installed" -ForegroundColor Red
    $issues = $true
}

# Check 3: vite.config.ts has react()
$viteConfig = Get-Content "vite.config.ts" -Raw -ErrorAction SilentlyContinue
$hasReactPlugin = $viteConfig -match 'react\(' -and $viteConfig -match '@vitejs/plugin-react'
if ($hasReactPlugin) {
    Write-Host "OK: vite.config.ts has React plugin configured" -ForegroundColor Green
} else {
    Write-Host "Issue 3: vite.config.ts missing React plugin" -ForegroundColor Red
    $issues = $true
}

Write-Host ""
if ($issues) {
    Write-Host "Please fix issues above and run: npm install" -ForegroundColor Yellow
} else {
    Write-Host "All checks passed - Vite is configured correctly!" -ForegroundColor Green
}

