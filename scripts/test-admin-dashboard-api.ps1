#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Test Admin Dashboard API Integration
.DESCRIPTION
    Tests all admin dashboard endpoints to verify backend-frontend integration
    Part of Sprint 1 Story 3: Backend API Integration Review
#>

param(
    [string]$BackendUrl = "http://localhost:8080",
    [string]$AdminToken = "",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Continue"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Admin Dashboard API Integration Test" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Color helper functions
function Write-Success { param($msg) Write-Host "✓ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "✗ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠ $msg" -ForegroundColor Yellow }

# Get admin token if not provided
if ([string]::IsNullOrEmpty($AdminToken)) {
    Write-Info "No token provided. Please provide an admin JWT token:"
    $AdminToken = Read-Host "Admin Token"
}

if ([string]::IsNullOrEmpty($AdminToken)) {
    Write-Error "Token is required. Exiting..."
    exit 1
}

# Test results
$results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Tests = @()
}

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedFields
    )

    $results.Total++
    Write-Host ""
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray

    try {
        $headers = @{
            "Authorization" = "Bearer $AdminToken"
            "Content-Type" = "application/json"
        }

        $response = Invoke-RestMethod -Uri $Url -Method Get -Headers $headers -ErrorAction Stop

        if ($Verbose) {
            Write-Host "Response:" -ForegroundColor Gray
            $response | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
        }

        # Check if response has success field
        if ($null -eq $response.success) {
            Write-Warning "Response missing 'success' field"
        } elseif ($response.success -ne $true) {
            throw "API returned success=false: $($response.message)"
        }

        # Check if response has data
        if ($null -eq $response.data) {
            throw "Response missing 'data' field"
        }

        # Verify expected fields
        if (-not [string]::IsNullOrEmpty($ExpectedFields)) {
            $fields = $ExpectedFields -split ','
            $missingFields = @()

            foreach ($field in $fields) {
                $fieldPath = $field.Trim() -split '\.'
                $obj = $response.data

                foreach ($part in $fieldPath) {
                    if ($null -eq $obj.$part) {
                        $missingFields += $field
                        break
                    }
                    $obj = $obj.$part
                }
            }

            if ($missingFields.Count -gt 0) {
                Write-Warning "Missing fields: $($missingFields -join ', ')"
            } else {
                Write-Success "All expected fields present"
            }
        }

        Write-Success "$Name - PASSED"
        $results.Passed++
        $results.Tests += @{
            Name = $Name
            Status = "PASSED"
            Url = $Url
        }

    } catch {
        Write-Error "$Name - FAILED"
        Write-Error "Error: $($_.Exception.Message)"

        $results.Failed++
        $results.Tests += @{
            Name = $Name
            Status = "FAILED"
            Url = $Url
            Error = $_.Exception.Message
        }
    }
}

# ==================== Run Tests ====================

Write-Info "Backend URL: $BackendUrl"
Write-Host ""

# Test 1: Get Admin Dashboard (30 days)
Test-Endpoint `
    -Name "GET /api/v1/dashboard/admin (default 30 days)" `
    -Url "$BackendUrl/api/v1/dashboard/admin" `
    -ExpectedFields "periodStart,periodEnd,periodDays,userMetrics,revenueMetrics,packageMetrics,orderMetrics,systemHealth"

# Test 2: Get Admin Dashboard (7 days)
Test-Endpoint `
    -Name "GET /api/v1/dashboard/admin/days/7" `
    -Url "$BackendUrl/api/v1/dashboard/admin/days/7" `
    -ExpectedFields "periodStart,periodEnd,periodDays,userMetrics.totalUsers,revenueMetrics.totalRevenue"

# Test 3: Get Admin Dashboard Realtime
Test-Endpoint `
    -Name "GET /api/v1/dashboard/admin/realtime" `
    -Url "$BackendUrl/api/v1/dashboard/admin/realtime" `
    -ExpectedFields "periodStart,periodEnd,periodDays,userMetrics,revenueMetrics"

# Test 4: Get Platform Snapshot
Test-Endpoint `
    -Name "GET /api/v1/dashboard/admin/snapshot" `
    -Url "$BackendUrl/api/v1/dashboard/admin/snapshot" `
    -ExpectedFields "totalUsers,activeUsers,totalRevenue,systemStatus"

# Test 5: Get Dashboard Analytics
Test-Endpoint `
    -Name "GET /api/v1/dashboard/analytics?period=week" `
    -Url "$BackendUrl/api/v1/dashboard/analytics?period=week" `
    -ExpectedFields ""

# Test 6: Time range test (custom dates)
$startDate = (Get-Date).AddDays(-14).ToString("yyyy-MM-ddT00:00:00")
$endDate = (Get-Date).ToString("yyyy-MM-ddT23:59:59")

Test-Endpoint `
    -Name "GET /api/v1/dashboard/admin (custom time range)" `
    -Url "$BackendUrl/api/v1/dashboard/admin?startTime=$startDate&endTime=$endDate" `
    -ExpectedFields "periodStart,periodEnd,periodDays"

# ==================== Summary ====================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Total Tests: $($results.Total)" -ForegroundColor White
Write-Success "Passed: $($results.Passed)"
Write-Error "Failed: $($results.Failed)"

$passRate = if ($results.Total -gt 0) { 
    [math]::Round(($results.Passed / $results.Total) * 100, 2) 
} else { 
    0 
}

Write-Host ""
Write-Host "Pass Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 50) { "Yellow" } else { "Red" })

# ==================== Detailed Results ====================

if ($Verbose) {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "Detailed Results" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""

    foreach ($test in $results.Tests) {
        Write-Host "Test: $($test.Name)" -ForegroundColor Yellow
        Write-Host "  URL: $($test.Url)" -ForegroundColor Gray
        Write-Host "  Status: $($test.Status)" -ForegroundColor $(if ($test.Status -eq "PASSED") { "Green" } else { "Red" })
        
        if ($test.Error) {
            Write-Host "  Error: $($test.Error)" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# ==================== Next Steps ====================

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Next Steps" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

if ($results.Failed -eq 0) {
    Write-Success "All tests passed! Backend-Frontend integration is working correctly."
    Write-Info "You can now proceed to:"
    Write-Host "  1. Story 3.2: DTO Type Alignment" -ForegroundColor White
    Write-Host "  2. Story 3.3: Error Handling Standardization" -ForegroundColor White
    Write-Host "  3. Story 3.4: Loading States Optimization" -ForegroundColor White
} else {
    Write-Warning "Some tests failed. Please review and fix the issues before proceeding."
    Write-Info "Common issues:"
    Write-Host "  1. Backend server not running (check http://localhost:8080)" -ForegroundColor White
    Write-Host "  2. Invalid admin token (get a fresh token from login)" -ForegroundColor White
    Write-Host "  3. Missing database data (run data seeding scripts)" -ForegroundColor White
    Write-Host "  4. CORS issues (check backend CORS configuration)" -ForegroundColor White
}

Write-Host ""

# Exit with appropriate code
exit $(if ($results.Failed -eq 0) { 0 } else { 1 })
