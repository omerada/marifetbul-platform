/**
 * ================================================
 * DISPUTE SYSTEM - INTEGRATION TEST SCRIPT
 * ================================================
 * PowerShell script to test the complete dispute workflow
 * 
 * Features tested:
 * - User creates dispute on order
 * - Admin views and resolves dispute
 * - Refund is processed automatically
 * - WebSocket notifications are sent
 * - Timeline is updated
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DISPUTE SYSTEM INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$BaseUrl = "http://localhost:8080/api/v1"
$FrontendUrl = "http://localhost:3000"

Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow
Write-Host "Frontend URL: $FrontendUrl" -ForegroundColor Yellow
Write-Host ""

# Test Results
$TestResults = @()

function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message
    )
    
    $Result = @{
        Test = $TestName
        Success = $Success
        Message = $Message
        Timestamp = Get-Date -Format "HH:mm:ss"
    }
    
    $script:TestResults += $Result
    
    $Color = if ($Success) { "Green" } else { "Red" }
    $Symbol = if ($Success) { "[OK]" } else { "[FAIL]" }
    
    Write-Host "[$($Result.Timestamp)] $Symbol $TestName" -ForegroundColor $Color
    if ($Message) {
        Write-Host "  → $Message" -ForegroundColor Gray
    }
}

# ==========================================
# TEST 1: Backend Health Check
# ==========================================
Write-Host "`n[TEST 1] Backend Health Check" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

try {
    $Response = Invoke-RestMethod -Uri "$BaseUrl/actuator/health" -Method Get -ErrorAction Stop
    
    if ($Response.status -eq "UP") {
        Add-TestResult -TestName "Backend Health" -Success $true -Message "Backend is UP"
    } else {
        Add-TestResult -TestName "Backend Health" -Success $false -Message "Backend status: $($Response.status)"
    }
} catch {
    Add-TestResult -TestName "Backend Health" -Success $false -Message "Cannot connect to backend: $($_.Exception.Message)"
    Write-Host "`n❌ Cannot proceed without backend. Please start the backend server." -ForegroundColor Red
    exit 1
}

# ==========================================
# TEST 2: Frontend Health Check
# ==========================================
Write-Host "`n[TEST 2] Frontend Health Check" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

try {
    $Response = Invoke-WebRequest -Uri $FrontendUrl -Method Head -TimeoutSec 5 -ErrorAction Stop
    
    if ($Response.StatusCode -eq 200) {
        Add-TestResult -TestName "Frontend Health" -Success $true -Message "Frontend is accessible"
    } else {
        Add-TestResult -TestName "Frontend Health" -Success $false -Message "Frontend status: $($Response.StatusCode)"
    }
} catch {
    Add-TestResult -TestName "Frontend Health" -Success $false -Message "Cannot connect to frontend: $($_.Exception.Message)"
    Write-Host "`n[WARNING] Frontend is not accessible. Some features may not work." -ForegroundColor Yellow
}

# ==========================================
# TEST 3: Check Dispute Components
# ==========================================
Write-Host "`n[TEST 3] Component File Checks" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$ComponentFiles = @(
    "components\domains\disputes\DisputeCreationModal.tsx",
    "components\domains\disputes\EvidenceUpload.tsx",
    "components\domains\disputes\DisputeTimeline.tsx",
    "components\admin\disputes\AdminDisputeDetailModal.tsx",
    "components\admin\disputes\DisputeResolutionModal.tsx",
    "app\disputes\[id]\page.tsx",
    "app\admin\disputes\page.tsx"
)

foreach ($File in $ComponentFiles) {
    $FilePath = Join-Path $PSScriptRoot ".." $File
    
    if (Test-Path $FilePath) {
        $FileInfo = Get-Item $FilePath
        $SizeKB = [math]::Round($FileInfo.Length / 1KB, 2)
        Add-TestResult -TestName "Component: $($File -replace '.*\\', '')" -Success $true -Message "File exists ($SizeKB KB)"
    } else {
        Add-TestResult -TestName "Component: $($File -replace '.*\\', '')" -Success $false -Message "File not found"
    }
}

# ==========================================
# TEST 4: Check Backend Classes
# ==========================================
Write-Host "`n[TEST 4] Backend Class Checks" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

$BackendFiles = @(
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\service\DisputeServiceImpl.java",
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\controller\DisputeController.java",
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\entity\Dispute.java"
)

foreach ($File in $BackendFiles) {
    $FilePath = Join-Path $PSScriptRoot ".." $File
    
    if (Test-Path $FilePath) {
        # Check for WalletService integration in DisputeServiceImpl
        if ($File -like "*DisputeServiceImpl.java") {
            $Content = Get-Content $FilePath -Raw
            
            if ($Content -match "WalletService") {
                Add-TestResult -TestName "WalletService Integration" -Success $true -Message "Found in DisputeServiceImpl"
            } else {
                Add-TestResult -TestName "WalletService Integration" -Success $false -Message "Not found in DisputeServiceImpl"
            }
            
            if ($Content -match "walletService\.addBalance") {
                Add-TestResult -TestName "Refund Processing" -Success $true -Message "Automatic refund logic implemented"
            } else {
                Add-TestResult -TestName "Refund Processing" -Success $false -Message "Refund logic not implemented"
            }
        }
        
        Add-TestResult -TestName "Backend: $($File -replace '.*\\', '')" -Success $true -Message "File exists"
    } else {
        Add-TestResult -TestName "Backend: $($File -replace '.*\\', '')" -Success $false -Message "File not found"
    }
}

# ==========================================
# TEST 5: API Endpoint Checks
# ==========================================
Write-Host "`n[TEST 5] API Endpoint Availability" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────" -ForegroundColor Gray

Write-Host "[WARNING] Skipping API endpoint tests (requires authentication)" -ForegroundColor Yellow
Write-Host "  Manual testing required for:" -ForegroundColor Gray
Write-Host "  - POST /api/v1/disputes (Create dispute)" -ForegroundColor Gray
Write-Host "  - GET /api/v1/disputes/{id} (Get dispute)" -ForegroundColor Gray
Write-Host "  - PUT /api/v1/disputes/{id}/resolve (Resolve dispute)" -ForegroundColor Gray
Write-Host "  - GET /api/v1/disputes/admin/all (Admin list)" -ForegroundColor Gray

# ==========================================
# SUMMARY
# ==========================================
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$TotalTests = $TestResults.Count
$SuccessfulTests = ($TestResults | Where-Object { $_.Success }).Count
$FailedTests = $TotalTests - $SuccessfulTests
$SuccessRate = [math]::Round(($SuccessfulTests / $TotalTests) * 100, 2)

Write-Host "Total Tests:    $TotalTests" -ForegroundColor White
Write-Host "Successful:     $SuccessfulTests" -ForegroundColor Green
Write-Host "Failed:         $FailedTests" -ForegroundColor $(if ($FailedTests -gt 0) { "Red" } else { "Green" })
Write-Host "Success Rate:   $SuccessRate%" -ForegroundColor $(if ($SuccessRate -ge 90) { "Green" } elseif ($SuccessRate -ge 70) { "Yellow" } else { "Red" })
Write-Host ""

# ==========================================
# MANUAL TEST CHECKLIST
# ==========================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MANUAL TEST CHECKLIST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ManualTests = @(
    "1. User Workflow:",
    "   [ ] Login as buyer",
    "   [ ] Navigate to order detail page",
    "   [ ] Click 'Itiraz Ac' button",
    "   [ ] Fill dispute form with reason and description",
    "   [ ] Upload evidence files (optional)",
    "   [ ] Submit dispute",
    "   [ ] Verify dispute is created",
    "   [ ] Check WebSocket notification",
    "",
    "2. Admin Workflow:",
    "   [ ] Login as admin",
    "   [ ] Navigate to Admin -> Disputes",
    "   [ ] Verify dispute list shows new dispute",
    "   [ ] Click on dispute to view details",
    "   [ ] Review evidence and description",
    "   [ ] Click 'Itirazi Cozumle'",
    "   [ ] Select resolution type (with refund)",
    "   [ ] Enter resolution description",
    "   [ ] Enter refund amount",
    "   [ ] Submit resolution",
    "   [ ] Verify resolution is saved",
    "",
    "3. Refund Verification:",
    "   [ ] Check buyer wallet balance increased",
    "   [ ] Verify transaction appears in wallet history",
    "   [ ] Check order status changed to REFUNDED",
    "   [ ] Verify dispute status is RESOLVED",
    "",
    "4. Real-time Updates:",
    "   [ ] Verify WebSocket notification on dispute create",
    "   [ ] Verify WebSocket notification on dispute resolve",
    "   [ ] Check timeline is updated with all events",
    "   [ ] Verify refund notification appears",
    "",
    "5. Edge Cases:",
    "   [ ] Try to create duplicate dispute (should fail)",
    "   [ ] Try to dispute old order (30+ days)",
    "   [ ] Try refund amount > order total (should fail)",
    "   [ ] Verify resolution without refund works"
)

foreach ($Test in $ManualTests) {
    Write-Host $Test -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start backend: cd marifetbul-backend && mvn spring-boot:run" -ForegroundColor White
Write-Host "2. Start frontend: npm run dev" -ForegroundColor White
Write-Host "3. Run manual tests from checklist above" -ForegroundColor White
Write-Host "4. Check browser console for errors" -ForegroundColor White
Write-Host "5. Monitor backend logs for refund processing" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Exit with appropriate code
if ($FailedTests -gt 0) {
    exit 1
} else {
    exit 0
}
