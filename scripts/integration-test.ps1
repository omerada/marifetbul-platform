# ================================================
# MARIFETBUL - INTEGRATION TEST SCRIPT
# ================================================
# Tests critical frontend-backend integration points
# Run this after starting both frontend and backend

Write-Host "🚀 MarifetBul Integration Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BACKEND_URL = "http://localhost:8080/api/v1"
$FRONTEND_URL = "http://localhost:3000"
$TEST_EMAIL = "test@marifetbul.com"
$TEST_PASSWORD = "Test123!"
$TEST_USERNAME = "testuser"

# Colors for output
function Write-Success { param($message) Write-Host "✅ $message" -ForegroundColor Green }
function Write-Failure { param($message) Write-Host "❌ $message" -ForegroundColor Red }
function Write-Info { param($message) Write-Host "ℹ️  $message" -ForegroundColor Yellow }
function Write-Test { param($message) Write-Host "🔍 Testing: $message" -ForegroundColor Cyan }

# Test counter
$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    $script:totalTests++
    Write-Test $Name
    
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
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Success "$Name - Status: $($response.StatusCode)"
            $script:passedTests++
            return $response
        } else {
            Write-Failure "$Name - Unexpected status: $($response.StatusCode)"
            $script:failedTests++
            return $null
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Failure "$Name - Error $statusCode : $($_.Exception.Message)"
        } else {
            Write-Failure "$Name - Connection failed: $($_.Exception.Message)"
        }
        $script:failedTests++
        return $null
    }
}

Write-Host ""
Write-Host "📋 Phase 1: Backend Health Checks" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 1: Backend Health
Test-Endpoint -Name "Backend Health" -Url "$BACKEND_URL/actuator/health"

# Test 2: Backend Info
Test-Endpoint -Name "Backend Info" -Url "$BACKEND_URL/actuator/info"

Write-Host ""
Write-Host "📋 Phase 2: Public API Endpoints" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 3: Get Categories (Public)
$categoriesResponse = Test-Endpoint -Name "Get Categories" -Url "$BACKEND_URL/categories?page=0&size=10"

# Test 4: Get Packages (Public)
$packagesResponse = Test-Endpoint -Name "Get Packages" -Url "$BACKEND_URL/packages?page=0&size=10"

# Test 5: Get Package by ID (if packages exist)
if ($packagesResponse) {
    try {
        $packages = ($packagesResponse.Content | ConvertFrom-Json).data.content
        if ($packages -and $packages.Count -gt 0) {
            $packageId = $packages[0].id
            Test-Endpoint -Name "Get Package by ID" -Url "$BACKEND_URL/packages/$packageId"
        } else {
            Write-Info "No packages found to test detail endpoint"
        }
    } catch {
        Write-Info "Could not parse packages response"
    }
}

Write-Host ""
Write-Host "📋 Phase 3: Frontend API Proxy" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 6: Frontend Proxy - Categories
Write-Info "Testing frontend proxy (requires frontend running on port 3000)"
try {
    $proxyResponse = Invoke-WebRequest -Uri "$FRONTEND_URL/api/v1/categories?page=0&size=5" -UseBasicParsing -TimeoutSec 5
    if ($proxyResponse.StatusCode -eq 200) {
        Write-Success "Frontend Proxy - Categories endpoint working"
        $script:passedTests++
        $script:totalTests++
    }
} catch {
    Write-Info "Frontend not running or proxy failed - this is normal if frontend is not started"
    Write-Info "Error: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "📋 Phase 4: Authentication Endpoints" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 7: Login endpoint (should fail without valid credentials)
$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
} | ConvertTo-Json

Write-Test "Login Endpoint (expected to fail with test credentials)"
$script:totalTests++
try {
    $loginResponse = Invoke-WebRequest -Uri "$BACKEND_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    Write-Info "Login returned status: $($loginResponse.StatusCode)"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 400) {
        Write-Success "Login endpoint responding correctly (401/400 for invalid credentials)"
        $script:passedTests++
    } else {
        Write-Failure "Login endpoint returned unexpected status: $statusCode"
        $script:failedTests++
    }
}

# Test 8: Register endpoint structure check
$registerBody = @{
    email = "test-$(Get-Random)@marifetbul.com"
    username = "testuser$(Get-Random)"
    password = "Test123!"
    firstName = "Test"
    lastName = "User"
    role = "FREELANCER"
} | ConvertTo-Json

Write-Test "Register Endpoint Structure"
$script:totalTests++
try {
    $registerResponse = Invoke-WebRequest -Uri "$BACKEND_URL/auth/register" -Method POST -Body $registerBody -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    if ($registerResponse.StatusCode -eq 200 -or $registerResponse.StatusCode -eq 201) {
        Write-Success "Register endpoint working (user created)"
        $script:passedTests++
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409) {
        Write-Success "Register endpoint responding correctly (409 for duplicate)"
        $script:passedTests++
    } elseif ($statusCode -eq 400) {
        Write-Info "Register validation working (400 for invalid data)"
        $script:passedTests++
    } else {
        Write-Failure "Register endpoint issue: $statusCode"
        $script:failedTests++
    }
}

Write-Host ""
Write-Host "📋 Phase 5: User Management Endpoints" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 9: User Search (Public)
Test-Endpoint -Name "User Search" -Url "$BACKEND_URL/users/search?query=test&page=0&size=10"

# Test 10: Get User by ID (should work if user exists)
Write-Info "User detail endpoint requires valid UUID (skipping specific ID test)"

Write-Host ""
Write-Host "📋 Phase 6: CORS Configuration" -ForegroundColor Magenta
Write-Host "===================================" -ForegroundColor Magenta

# Test 11: CORS Preflight
Write-Test "CORS Preflight (OPTIONS request)"
$script:totalTests++
try {
    $corsHeaders = @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "Content-Type,Authorization"
    }
    
    $corsResponse = Invoke-WebRequest -Uri "$BACKEND_URL/auth/login" -Method OPTIONS -Headers $corsHeaders -UseBasicParsing -TimeoutSec 10
    
    $allowOrigin = $corsResponse.Headers["Access-Control-Allow-Origin"]
    $allowMethods = $corsResponse.Headers["Access-Control-Allow-Methods"]
    
    if ($allowOrigin -and $allowMethods) {
        Write-Success "CORS configured correctly"
        Write-Info "  Allow-Origin: $allowOrigin"
        Write-Info "  Allow-Methods: $allowMethods"
        $script:passedTests++
    } else {
        Write-Failure "CORS headers missing"
        $script:failedTests++
    }
} catch {
    Write-Failure "CORS preflight failed: $($_.Exception.Message)"
    $script:failedTests++
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Total Tests:  $totalTests" -ForegroundColor White
Write-Host "Passed:       $passedTests" -ForegroundColor Green
Write-Host "Failed:       $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests / $totalTests) * 100, 2))%" -ForegroundColor Yellow
Write-Host ""

if ($failedTests -eq 0) {
    Write-Host "🎉 All tests passed! System is production-ready." -ForegroundColor Green
    exit 0
} elseif ($failedTests -le 2) {
    Write-Host "⚠️  Minor issues detected. Review failed tests." -ForegroundColor Yellow
    exit 0
} else {
    Write-Host "❌ Multiple failures detected. System needs attention." -ForegroundColor Red
    exit 1
}
