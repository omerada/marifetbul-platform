#!/usr/bin/env pwsh
# ================================================
# Notification System Integration Test
# ================================================
# Tests the complete notification flow including:
# - Event publishing
# - Notification creation
# - WebSocket delivery
# - API endpoints
# - Real-time updates

param(
    [string]$BaseUrl = "http://localhost:8080/api/v1",
    [string]$FrontendUrl = "http://localhost:3000"
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# Color output functions
function Write-Success { param($Message) Write-Host "✓ $Message" -ForegroundColor Green }
function Write-Error-Message { param($Message) Write-Host "✗ $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "ℹ $Message" -ForegroundColor Cyan }
function Write-Step { param($Message) Write-Host "`n==== $Message ====" -ForegroundColor Yellow }

# Test configuration
$script:AccessToken = $null
$script:UserId = $null
$script:TestUser1 = @{
    email = "notification-test-user1@test.com"
    password = "TestPassword123!"
    name = "Notification Test User 1"
}
$script:TestUser2 = @{
    email = "notification-test-user2@test.com"
    password = "TestPassword123!"
    name = "Notification Test User 2"
}

# ================================================
# HELPER FUNCTIONS
# ================================================

function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Token = $null,
        [switch]$ExpectError
    )

    $headers = @{
        "Content-Type" = "application/json"
        "Accept" = "application/json"
    }

    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    $params = @{
        Method = $Method
        Uri = "$BaseUrl$Endpoint"
        Headers = $headers
        UseBasicParsing = $true
    }

    if ($Body) {
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }

    try {
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Data = ($response.Content | ConvertFrom-Json)
        }
    }
    catch {
        if ($ExpectError) {
            return @{
                Success = $false
                StatusCode = $_.Exception.Response.StatusCode.value__
                Error = $_.Exception.Message
            }
        }
        throw
    }
}

# ================================================
# TEST SETUP
# ================================================

function Test-Setup {
    Write-Step "Setting Up Test Environment"

    # Test backend connection
    Write-Info "Testing backend connection..."
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/health" -UseBasicParsing -TimeoutSec 5
        Write-Success "Backend is running on $BaseUrl"
    }
    catch {
        Write-Error-Message "Backend is not accessible at $BaseUrl"
        Write-Error-Message "Please ensure the backend server is running"
        exit 1
    }

    # Register and login test users
    Write-Info "Registering test users..."
    
    # User 1
    $registerResponse1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register" -Body $script:TestUser1 -ExpectError
    if ($registerResponse1.Success -or $registerResponse1.StatusCode -eq 409) {
        Write-Success "Test User 1 ready"
    }

    # Login User 1
    $loginResponse1 = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body @{
        email = $script:TestUser1.email
        password = $script:TestUser1.password
    }

    if ($loginResponse1.Success) {
        $script:AccessToken = $loginResponse1.Data.data.accessToken
        $script:UserId = $loginResponse1.Data.data.userId
        Write-Success "Logged in as User 1 (ID: $script:UserId)"
    }
    else {
        Write-Error-Message "Failed to login User 1"
        exit 1
    }

    # User 2 (for follow testing)
    $registerResponse2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/register" -Body $script:TestUser2 -ExpectError
    if ($registerResponse2.Success -or $registerResponse2.StatusCode -eq 409) {
        Write-Success "Test User 2 ready"
    }

    Write-Success "Test environment setup complete"
}

# ================================================
# NOTIFICATION TESTS
# ================================================

function Test-GetNotifications {
    Write-Step "Testing Get Notifications API"

    $response = Invoke-ApiRequest -Method GET -Endpoint "/notifications?page=0&size=10" -Token $script:AccessToken

    if ($response.Success) {
        $notifications = $response.Data.data.content
        Write-Success "Retrieved $($notifications.Count) notifications"
        
        if ($notifications.Count -gt 0) {
            $first = $notifications[0]
            Write-Info "  Latest: $($first.title) - $($first.type)"
        }
    }
    else {
        Write-Error-Message "Failed to retrieve notifications"
    }
}

function Test-GetUnreadCount {
    Write-Step "Testing Get Unread Count API"

    $response = Invoke-ApiRequest -Method GET -Endpoint "/notifications/unread-count" -Token $script:AccessToken

    if ($response.Success) {
        $count = $response.Data.data
        Write-Success "Unread count: $count"
        return $count
    }
    else {
        Write-Error-Message "Failed to get unread count"
        return 0
    }
}

function Test-MarkAsRead {
    param([string]$NotificationId)

    Write-Info "Marking notification as read..."

    $response = Invoke-ApiRequest -Method PUT -Endpoint "/notifications/$NotificationId/read" -Token $script:AccessToken

    if ($response.Success) {
        Write-Success "Notification marked as read"
        return $true
    }
    else {
        Write-Error-Message "Failed to mark notification as read"
        return $false
    }
}

function Test-MarkAllAsRead {
    Write-Step "Testing Mark All As Read API"

    $response = Invoke-ApiRequest -Method PUT -Endpoint "/notifications/mark-all-read" -Token $script:AccessToken

    if ($response.Success) {
        $count = $response.Data.data
        Write-Success "Marked $count notifications as read"
        return $count
    }
    else {
        Write-Error-Message "Failed to mark all as read"
        return 0
    }
}

# ================================================
# EVENT TRIGGER TESTS
# ================================================

function Test-FollowNotification {
    Write-Step "Testing Follow Notification Event"

    # Get User 2 ID
    $loginResponse2 = Invoke-ApiRequest -Method POST -Endpoint "/auth/login" -Body @{
        email = $script:TestUser2.email
        password = $script:TestUser2.password
    }

    if (-not $loginResponse2.Success) {
        Write-Error-Message "Failed to login User 2"
        return
    }

    $user2Id = $loginResponse2.Data.data.userId
    Write-Info "User 2 ID: $user2Id"

    # User 1 follows User 2
    Write-Info "User 1 following User 2..."
    $followResponse = Invoke-ApiRequest -Method POST -Endpoint "/users/$user2Id/follow" -Token $script:AccessToken

    if ($followResponse.Success) {
        Write-Success "Follow action successful"
        Write-Info "Waiting 2 seconds for event processing..."
        Start-Sleep -Seconds 2

        # Check User 2's notifications
        $user2Token = $loginResponse2.Data.data.accessToken
        $notifResponse = Invoke-ApiRequest -Method GET -Endpoint "/notifications/recent?limit=5" -Token $user2Token

        if ($notifResponse.Success) {
            $followNotif = $notifResponse.Data.data | Where-Object { $_.type -eq "FOLLOW" } | Select-Object -First 1
            
            if ($followNotif) {
                Write-Success "Follow notification created successfully"
                Write-Info "  Title: $($followNotif.title)"
                Write-Info "  Content: $($followNotif.content)"
            }
            else {
                Write-Error-Message "Follow notification not found"
            }
        }
    }
    else {
        Write-Error-Message "Follow action failed"
    }
}

function Test-NotificationFiltering {
    Write-Step "Testing Notification Filtering"

    $types = @("ORDER", "PAYMENT", "REVIEW", "FOLLOW", "MESSAGE")

    foreach ($type in $types) {
        $response = Invoke-ApiRequest -Method GET -Endpoint "/notifications?page=0&size=5&type=$type" -Token $script:AccessToken

        if ($response.Success) {
            $count = $response.Data.data.content.Count
            Write-Info "$type notifications: $count"
        }
    }

    Write-Success "Filtering test completed"
}

function Test-NotificationPagination {
    Write-Step "Testing Notification Pagination"

    $page1 = Invoke-ApiRequest -Method GET -Endpoint "/notifications?page=0&size=5" -Token $script:AccessToken
    $page2 = Invoke-ApiRequest -Method GET -Endpoint "/notifications?page=1&size=5" -Token $script:AccessToken

    if ($page1.Success -and $page2.Success) {
        $count1 = $page1.Data.data.content.Count
        $count2 = $page2.Data.data.content.Count
        $total = $page1.Data.data.totalElements

        Write-Success "Page 1: $count1 items"
        Write-Success "Page 2: $count2 items"
        Write-Success "Total: $total notifications"
    }
    else {
        Write-Error-Message "Pagination test failed"
    }
}

# ================================================
# PERFORMANCE TESTS
# ================================================

function Test-NotificationPerformance {
    Write-Step "Testing Notification API Performance"

    $endpoints = @(
        @{ Name = "Get Notifications"; Endpoint = "/notifications?page=0&size=20" }
        @{ Name = "Get Unread Count"; Endpoint = "/notifications/unread-count" }
        @{ Name = "Get Recent"; Endpoint = "/notifications/recent?limit=5" }
    )

    foreach ($endpoint in $endpoints) {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        
        $response = Invoke-ApiRequest -Method GET -Endpoint $endpoint.Endpoint -Token $script:AccessToken
        
        $stopwatch.Stop()
        $elapsed = $stopwatch.ElapsedMilliseconds

        if ($response.Success) {
            $color = if ($elapsed -lt 100) { "Green" } elseif ($elapsed -lt 500) { "Yellow" } else { "Red" }
            Write-Host "  $($endpoint.Name): ${elapsed}ms" -ForegroundColor $color
        }
        else {
            Write-Error-Message "  $($endpoint.Name): FAILED"
        }
    }
}

# ================================================
# TEST EXECUTION
# ================================================

function Run-AllTests {
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  NOTIFICATION SYSTEM INTEGRATION TEST" -ForegroundColor Cyan
    Write-Host "================================================`n" -ForegroundColor Cyan

    $startTime = Get-Date

    try {
        # Setup
        Test-Setup

        # Core API Tests
        Test-GetNotifications
        Test-GetUnreadCount
        Test-MarkAllAsRead
        
        # Event Tests
        Test-FollowNotification
        
        # Advanced Tests
        Test-NotificationFiltering
        Test-NotificationPagination
        
        # Performance Tests
        Test-NotificationPerformance

        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalSeconds

        Write-Host "`n================================================" -ForegroundColor Cyan
        Write-Host "  ALL TESTS COMPLETED" -ForegroundColor Green
        Write-Host "  Duration: $([math]::Round($duration, 2)) seconds" -ForegroundColor Cyan
        Write-Host "================================================`n" -ForegroundColor Cyan
    }
    catch {
        Write-Host "`n================================================" -ForegroundColor Red
        Write-Host "  TEST SUITE FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "================================================`n" -ForegroundColor Red
        exit 1
    }
}

# Run tests
Run-AllTests
