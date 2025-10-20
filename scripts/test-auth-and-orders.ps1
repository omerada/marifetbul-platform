# Test Script for Authentication and Orders API
# This script tests the full authentication flow and orders API

Write-Host "=== MarifetBul Auth & Orders Test ===" -ForegroundColor Cyan
Write-Host ""

$BACKEND_URL = "http://localhost:8080/api/v1"
$FRONTEND_URL = "http://localhost:3000"

# Test credentials (from TEST_USERS.md)
$freelancerEmail = "freelancer@test.com"
$freelancerPassword = "Test123!@#"

Write-Host "[1/6] Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BACKEND_URL/health" -Method Get -ErrorAction Stop
    Write-Host "OK Backend is healthy: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "X Backend is not responding!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/6] Testing Freelancer Login..." -ForegroundColor Yellow
$loginBody = @{
    usernameOrEmail = $freelancerEmail
    password = $freelancerPassword
} | ConvertTo-Json

try {
    $session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    
    $loginResponse = Invoke-WebRequest `
        -Uri "$BACKEND_URL/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -ErrorAction Stop

    Write-Host "OK Login successful! Status: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $userId = $loginData.data.user.id
    $userRole = $loginData.data.user.role
    
    Write-Host "  User ID: $userId" -ForegroundColor Gray
    Write-Host "  Role: $userRole" -ForegroundColor Gray
    
    if ($session.Cookies.GetCookies($BACKEND_URL).Count -gt 0) {
        Write-Host "  Cookies received: $($session.Cookies.GetCookies($BACKEND_URL).Count)" -ForegroundColor Gray
    } else {
        Write-Host "  Warning: No cookies received!" -ForegroundColor Yellow
    }
} catch {
    Write-Host "X Login failed!" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/6] Testing Token Refresh..." -ForegroundColor Yellow
try {
    $refreshResponse = Invoke-WebRequest `
        -Uri "$BACKEND_URL/auth/refresh" `
        -Method Post `
        -ContentType "application/json" `
        -Body "{}" `
        -WebSession $session `
        -ErrorAction Stop

    Write-Host "OK Token refresh successful! Status: $($refreshResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "X Token refresh failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[4/6] Testing User Profile API..." -ForegroundColor Yellow
try {
    $profileResponse = Invoke-WebRequest `
        -Uri "$BACKEND_URL/users/$userId" `
        -Method Get `
        -WebSession $session `
        -ErrorAction Stop

    Write-Host "OK Profile fetch successful! Status: $($profileResponse.StatusCode)" -ForegroundColor Green
    $profileData = $profileResponse.Content | ConvertFrom-Json
    Write-Host "  Name: $($profileData.data.firstName) $($profileData.data.lastName)" -ForegroundColor Gray
} catch {
    Write-Host "X Profile fetch failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host ""
Write-Host "[5/6] Testing Orders API (Backend)..." -ForegroundColor Yellow
try {
    $ordersResponse = Invoke-WebRequest `
        -Uri "$BACKEND_URL/orders/seller/me?page=0&size=20&sort=createdAt,desc" `
        -Method Get `
        -WebSession $session `
        -ErrorAction Stop

    Write-Host "OK Orders fetch successful! Status: $($ordersResponse.StatusCode)" -ForegroundColor Green
    $ordersData = $ordersResponse.Content | ConvertFrom-Json
    Write-Host "  Total orders: $($ordersData.data.Count)" -ForegroundColor Gray
} catch {
    Write-Host "X Orders fetch failed!" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "  Info: 403 Forbidden - Check backend authorization" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[6/6] Testing Frontend Orders Proxy..." -ForegroundColor Yellow
Write-Host "  Note: This requires frontend running and logged in via browser" -ForegroundColor DarkGray
Write-Host "  Manual test: Navigate to http://localhost:3000/dashboard/freelancer" -ForegroundColor DarkGray

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed except Orders (403), possible issues:" -ForegroundColor Yellow
Write-Host "  1. Backend authorization rules may block API calls" -ForegroundColor Gray
Write-Host "  2. User role might not have access to orders endpoint" -ForegroundColor Gray
Write-Host "  3. Cookie forwarding in Next.js API routes may need debugging" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Check backend logs: docker logs marifetbul-backend | Select-String 'orders'" -ForegroundColor Gray
Write-Host "  2. Verify frontend .env.local has correct URLs" -ForegroundColor Gray
Write-Host "  3. Test in browser with Network tab open" -ForegroundColor Gray
Write-Host ""
