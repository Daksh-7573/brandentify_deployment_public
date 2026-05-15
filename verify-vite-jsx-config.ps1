#!/usr/bin/env pwsh

# Vite JSX File Naming Verification Script
# Run this anytime to check for JSX files with wrong extensions

Write-Host "🔍 Vite JSX Configuration Checker" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

$issues = $false

# Check 1: Look for .ts files with JSX in components
Write-Host "1. Checking for .ts files with JSX in components..." -ForegroundColor Yellow
$tsFilesWithJSX = Get-ChildItem -Path "client/src/components" -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.tsx" }

if ($tsFilesWithJSX) {
    Write-Host "FOUND - Renaming required:" -ForegroundColor Red
    $tsFilesWithJSX | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Red }
    $issues = $true
} else {
    Write-Host "OK - No .ts files with JSX found" -ForegroundColor Green
}

Write-Host ""

# Check 2: Look for .js files with JSX
Write-Host "2. Checking for .js files with JSX..." -ForegroundColor Yellow
$jsFilesWithJSX = Get-ChildItem -Path "client/src" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike "*.jsx" } | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match 'return\s*[(<]|<[A-Z]|<div|<span|<button') {
        $_
    }
}

if ($jsFilesWithJSX) {
    Write-Host "❌ FOUND .JS FILES WITH JSX:" -ForegroundColor Red
    $jsFilesWithJSX | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Red }
    $issues = $true
} else {
    Write-Host "✅ No .js files with JSX found" -ForegroundColor Green
}

Write-Host ""

# Check 3: Verify React plugin is installed
Write-Host "3. Checking React plugin installation..." -ForegroundColor Yellow
$vitejsReactInstalled = Test-Path "node_modules/@vitejs/plugin-react"
if ($vitejsReactInstalled) {
    Write-Host "✅ @vitejs/plugin-react is installed" -ForegroundColor Green
} else {
    Write-Host "❌ @vitejs/plugin-react is NOT installed" -ForegroundColor Red
    $issues = $true
}

Write-Host ""

# Check 4: Verify vite.config.ts has React plugin
Write-Host "4. Checking vite.config.ts for React plugin..." -ForegroundColor Yellow
$viteConfig = Get-Content "vite.config.ts" -Raw
if ($viteConfig -match 'react\(' -and $viteConfig -match 'from "@vitejs/plugin-react"') {
    Write-Host "✅ React plugin is configured in vite.config.ts" -ForegroundColor Green
} else {
    Write-Host "❌ React plugin is NOT properly configured in vite.config.ts" -ForegroundColor Red
    $issues = $true
}

Write-Host ""

# Summary
Write-Host "=================================" -ForegroundColor Cyan
if ($issues) {
    Write-Host "WARNING: ISSUES FOUND - Run the fix:" -ForegroundColor Red
    Write-Host "Remove-Item dist -Recurse -Force; Remove-Item node_modules -Recurse -Force; npm install; npm run build" -ForegroundColor Yellow
} else {
    Write-Host "SUCCESS: All checks passed - Your Vite setup is correct" -ForegroundColor Green
}

Write-Host ""
