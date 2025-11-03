#!/usr/bin/env pwsh
<#
.SYNOPSIS
    MarifetBul Moderation System Integration Tests
    
.DESCRIPTION
    Tests moderator API endpoints with real HTTP calls
    Validates frontend API routes and backend integration
    
.PARAMETER BackendUrl
    Backend API base URL (default: http://localhost:8080)
    
.PARAMETER FrontendUrl
    Frontend API base URL (default: http://localhost:3000)
    
.PARAMETER Token
    JWT authentication token (if available)
    
.EXAMPLE
    .\test-moderation-integration.ps1
    
.EXAMPLE
    .\test-moderation-integration.ps1 -Token "eyJhbGc..."
    
.NOTES
    Sprint 1 - Day 3: Integration Testing
    Author: MarifetBul Development Team
    Date: November 3, 2025
#>

param(
    [string]$BackendUrl = "http://localhost:8080",
    [string]$FrontendUrl = "http://localhost:3000",
    [string]$Token = ""
)

# ================================================
# CONFIGURATION
# ================================================

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

$script:PassedTests = 0
$script:FailedTests = 0
$script:SkippedTests = 0

# ================================================
# HELPER FUNCTIONS
# ================================================

function Write-TestHeader {
    param([string]$Title)
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "================================================" -ForegroundColor Cyan
}

function Write-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = ""
    )
    
    if ($Passed) {
        Write-Host "✅ PASS: $TestName" -ForegroundColor Green
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Gray }
        $script:PassedTests++
    } else {
        Write-Host "❌ FAIL: $TestName" -ForegroundColor Red
        if ($Message) { Write-Host "   → $Message" -ForegroundColor Yellow }
        $script:FailedTests++
    }
}

function Write-TestSkipped {
    param([string]$TestName, [string]$Reason)
    Write-Host "⏭️  SKIP: $TestName" -ForegroundColor Yellow
    Write-Host "   → $Reason" -ForegroundColor Gray
    $script:SkippedTests++
}

function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
            Headers = $response.Headers
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode.Value__
        }
    }
}

# ================================================
# PRE-FLIGHT CHECKS
# ================================================

Write-TestHeader "PRE-FLIGHT CHECKS"

# Check if backend is accessible
$backendHealth = Test-Endpoint -Url "$BackendUrl/actuator/health"
if ($backendHealth.Success) {
    Write-TestResult -TestName "Backend Health Check" -Passed $true -Message "Backend is running on $BackendUrl"
} else {
    Write-TestResult -TestName "Backend Health Check" -Passed $false -Message "Backend not accessible: $($backendHealth.Error)"
    Write-Host "`n⚠️  Backend is not running. Starting with frontend-only tests..." -ForegroundColor Yellow
}

# Check if frontend is accessible
$frontendHealth = Test-Endpoint -Url "$FrontendUrl/api/health"
if ($frontendHealth.Success) {
    Write-TestResult -TestName "Frontend Health Check" -Passed $true -Message "Frontend is running on $FrontendUrl"
} else {
    Write-TestResult -TestName "Frontend Health Check" -Passed $false -Message "Frontend not accessible: $($frontendHealth.Error)"
}

# ================================================
# AUTHENTICATION
# ================================================

Write-TestHeader "AUTHENTICATION TESTS"

if (-not $Token) {
    Write-TestSkipped -TestName "JWT Token Validation" -Reason "No token provided. Use -Token parameter to test authenticated endpoints"
} else {
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    # Test token validity with a protected endpoint
    $tokenTest = Test-Endpoint -Url "$BackendUrl/api/v1/moderator/stats" -Headers $headers
    Write-TestResult -TestName "JWT Token Validation" -Passed $tokenTest.Success -Message "Token status: $(if ($tokenTest.Success) { 'Valid' } else { 'Invalid or expired' })"
}

# ================================================
# FRONTEND API ROUTES
# ================================================

Write-TestHeader "FRONTEND API ROUTES"

$headers = @{}
if ($Token) {
    $headers["Authorization"] = "Bearer $Token"
}

# Test stats endpoint
$statsTest = Test-Endpoint -Url "$FrontendUrl/api/v1/moderator/stats" -Headers $headers
Write-TestResult -TestName "GET /api/v1/moderator/stats" -Passed $statsTest.Success -Message "Status: $($statsTest.StatusCode)"

if ($statsTest.Success) {
    try {
        $statsData = $statsTest.Content | ConvertFrom-Json
        Write-Host "   → Pending: $($statsData.pending), Approved: $($statsData.approved), Rejected: $($statsData.rejected)" -ForegroundColor Gray
    } catch {
        Write-Host "   → Response received but not JSON formatted" -ForegroundColor Gray
    }
}

# Test pending items endpoint
$pendingTest = Test-Endpoint -Url "$FrontendUrl/api/v1/moderator/pending-items?page=0&size=10" -Headers $headers
Write-TestResult -TestName "GET /api/v1/moderator/pending-items" -Passed $pendingTest.Success -Message "Status: $($pendingTest.StatusCode)"

if ($pendingTest.Success) {
    try {
        $pendingData = $pendingTest.Content | ConvertFrom-Json
        Write-Host "   → Total Items: $($pendingData.totalItems), Current Page: $($pendingData.currentPage)" -ForegroundColor Gray
    } catch {
        Write-Host "   → Response received but not JSON formatted" -ForegroundColor Gray
    }
}

# Test recent activity endpoint
$activityTest = Test-Endpoint -Url "$FrontendUrl/api/v1/moderator/recent-activity?limit=10" -Headers $headers
Write-TestResult -TestName "GET /api/v1/moderator/recent-activity" -Passed $activityTest.Success -Message "Status: $($activityTest.StatusCode)"

# ================================================
# BACKEND ENDPOINTS (if available)
# ================================================

if ($backendHealth.Success -and $Token) {
    Write-TestHeader "BACKEND API ENDPOINTS"
    
    $headers = @{
        "Authorization" = "Bearer $Token"
    }
    
    # Test comment endpoints
    $commentStatsTest = Test-Endpoint -Url "$BackendUrl/api/v1/blog/admin/comments/stats" -Headers $headers
    Write-TestResult -TestName "GET /api/v1/blog/admin/comments/stats" -Passed $commentStatsTest.Success -Message "Status: $($commentStatsTest.StatusCode)"
    
    # Test review moderation endpoints
    $reviewModerationTest = Test-Endpoint -Url "$BackendUrl/api/v1/review/moderation/pending" -Headers $headers
    Write-TestResult -TestName "GET /api/v1/review/moderation/pending" -Passed $reviewModerationTest.Success -Message "Status: $($reviewModerationTest.StatusCode)"
}

# ================================================
# MODERATION ACTIONS (Manual)
# ================================================

Write-TestHeader "MODERATION ACTIONS (Manual Testing Required)"

Write-Host @"

⚠️  The following actions require manual testing in the UI:

1. COMMENT APPROVAL
   - Navigate to: http://localhost:3000/moderator/comments
   - Select a pending comment
   - Click "Approve" button
   - Verify: Toast notification appears
   - Verify: Comment removed from queue
   
2. COMMENT REJECTION
   - Select a pending comment
   - Click "Reject" button
   - Enter rejection reason
   - Verify: Toast notification appears
   - Verify: Comment removed from queue
   
3. SPAM MARKING
   - Select a pending comment
   - Click "Mark as Spam" button
   - Verify: Toast notification appears
   - Verify: Comment removed from queue
   
4. BULK APPROVAL
   - Select multiple comments (checkbox)
   - Click "Bulk Approve" in toolbar
   - Verify: Success count shown
   - Verify: All selected comments removed
   
5. BULK REJECTION
   - Select multiple comments
   - Click "Bulk Reject" in toolbar
   - Enter rejection reason
   - Verify: Success/failure counts shown
   
6. PAGINATION
   - Change page size (10, 25, 50)
   - Navigate between pages
   - Verify: Data loads correctly
   
7. FILTERING
   - Filter by status (PENDING, APPROVED, etc.)
   - Filter by date range
   - Search by content
   - Verify: Results update correctly
   
8. AUTO-REFRESH
   - Wait 30 seconds
   - Verify: Data refreshes automatically
   - Check console for refresh logs

"@ -ForegroundColor Cyan

# ================================================
# TEST SUMMARY
# ================================================

Write-TestHeader "TEST SUMMARY"

$total = $script:PassedTests + $script:FailedTests + $script:SkippedTests

Write-Host "Total Tests: $total" -ForegroundColor White
Write-Host "✅ Passed: $script:PassedTests" -ForegroundColor Green
Write-Host "❌ Failed: $script:FailedTests" -ForegroundColor Red
Write-Host "⏭️  Skipped: $script:SkippedTests" -ForegroundColor Yellow

if ($script:FailedTests -eq 0) {
    Write-Host "`n🎉 All automated tests passed!" -ForegroundColor Green
    Write-Host "   Continue with manual UI testing..." -ForegroundColor Gray
} else {
    Write-Host "`n⚠️  Some tests failed. Review the output above." -ForegroundColor Yellow
}

Write-Host "`n================================================`n" -ForegroundColor Cyan

# Return exit code based on failures
exit $script:FailedTests
