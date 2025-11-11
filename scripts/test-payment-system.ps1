#!/usr/bin/env pwsh
# ================================================
# PAYMENT SYSTEM TEST RUNNER
# ================================================
# Runs all Sprint 1 payment system tests
# 
# Usage:
#   .\scripts\test-payment-system.ps1
#   .\scripts\test-payment-system.ps1 -Coverage
#   .\scripts\test-payment-system.ps1 -E2E
#   .\scripts\test-payment-system.ps1 -All
#
# @author MarifetBul Development Team
# @version 1.0.0
# @since Sprint 1 - Testing & QA
# ================================================

param(
    [switch]$Coverage,
    [switch]$E2E,
    [switch]$All,
    [switch]$Watch,
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "SPRINT 1: PAYMENT SYSTEM TEST SUITE" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Function to run tests with nice output
function Run-TestSuite {
    param(
        [string]$Name,
        [string]$Command,
        [string]$Icon
    )
    
    Write-Host "$Icon  $Name" -ForegroundColor Yellow
    Write-Host "   Command: $Command" -ForegroundColor Gray
    Write-Host ""
    
    try {
        Invoke-Expression $Command
        Write-Host ""
        Write-Host "✅ $Name - PASSED" -ForegroundColor Green
        Write-Host ""
        return $true
    }
    catch {
        Write-Host ""
        Write-Host "❌ $Name - FAILED" -ForegroundColor Red
        Write-Host "   Error: $_" -ForegroundColor Red
        Write-Host ""
        return $false
    }
}

$results = @()

# Unit Tests - Payment Validation
if ($All -or -not ($E2E)) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "UNIT TESTS: Payment Validation" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    $cmd = if ($Coverage) {
        "npm run test -- __tests__/lib/validations/payment.test.ts --coverage --coverageDirectory=coverage/validation"
    } elseif ($Watch) {
        "npm run test:watch -- __tests__/lib/validations/payment.test.ts"
    } else {
        "npm run test -- __tests__/lib/validations/payment.test.ts"
    }
    
    if ($Verbose) { $cmd += " --verbose" }
    
    $results += Run-TestSuite -Name "Payment Validation Tests" -Command $cmd -Icon "🔍"
}

# Integration Tests - useIyzicoPayment Hook
if ($All -or -not ($E2E)) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "INTEGRATION TESTS: useIyzicoPayment Hook" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    $cmd = if ($Coverage) {
        "npm run test -- __tests__/hooks/useIyzicoPayment.test.ts --coverage --coverageDirectory=coverage/hooks"
    } elseif ($Watch) {
        "npm run test:watch -- __tests__/hooks/useIyzicoPayment.test.ts"
    } else {
        "npm run test -- __tests__/hooks/useIyzicoPayment.test.ts"
    }
    
    if ($Verbose) { $cmd += " --verbose" }
    
    $results += Run-TestSuite -Name "useIyzicoPayment Hook Tests" -Command $cmd -Icon "🪝"
}

# E2E Tests - Full Payment Flow
if ($All -or $E2E) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "END-TO-END TESTS: Payment Flow" -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
    
    $cmd = "npm run test:e2e -- tests/e2e/payment-flow.spec.ts"
    
    if ($Verbose) { $cmd += " --reporter=list" }
    
    $results += Run-TestSuite -Name "Payment Flow E2E Tests" -Command $cmd -Icon "🌐"
}

# Summary
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($results | Where-Object { $_ -eq $true }).Count
$failed = ($results | Where-Object { $_ -eq $false }).Count
$total = $results.Count

Write-Host "Total Test Suites: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host ""

if ($Coverage) {
    Write-Host "📊 Coverage reports generated:" -ForegroundColor Yellow
    Write-Host "   - Validation: coverage/validation/" -ForegroundColor Gray
    Write-Host "   - Hooks: coverage/hooks/" -ForegroundColor Gray
    Write-Host ""
}

if ($failed -gt 0) {
    Write-Host "❌ Some tests failed. Please review the output above." -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ All tests passed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Sprint 1 Payment System - Quality Assured!" -ForegroundColor Cyan
    exit 0
}
