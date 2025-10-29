# ================================================
# DISPUTE SYSTEM - QUICK TEST
# ================================================
# Simple test script for dispute system components

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DISPUTE SYSTEM QUICK TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$TestsPassed = 0
$TestsFailed = 0

# Test 1: Check frontend components
Write-Host "[1] Checking Frontend Components..." -ForegroundColor Yellow

$FrontendFiles = @(
    "components\domains\disputes\DisputeCreationModal.tsx",
    "components\domains\disputes\EvidenceUpload.tsx",
    "components\domains\disputes\DisputeTimeline.tsx",
    "components\domains\disputes\index.ts",
    "components\admin\disputes\AdminDisputeDetailModal.tsx",
    "components\admin\disputes\DisputeResolutionModal.tsx",
    "components\admin\disputes\index.ts",
    "app\disputes\[id]\page.tsx",
    "app\admin\disputes\page.tsx"
)

foreach ($File in $FrontendFiles) {
    if (Test-Path $File) {
        Write-Host "  [OK] $File" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  [FAIL] $File NOT FOUND" -ForegroundColor Red
        $TestsFailed++
    }
}

# Test 2: Check backend files
Write-Host "`n[2] Checking Backend Files..." -ForegroundColor Yellow

$BackendFiles = @(
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\service\DisputeServiceImpl.java",
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\controller\DisputeController.java",
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\entity\Dispute.java",
    "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\repository\DisputeRepository.java"
)

foreach ($File in $BackendFiles) {
    if (Test-Path $File) {
        Write-Host "  [OK] $File" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  [FAIL] $File NOT FOUND" -ForegroundColor Red
        $TestsFailed++
    }
}

# Test 3: Check WalletService integration
Write-Host "`n[3] Checking WalletService Integration..." -ForegroundColor Yellow

$ServiceFile = "marifetbul-backend\src\main\java\com\marifetbul\api\domain\dispute\service\DisputeServiceImpl.java"
if (Test-Path $ServiceFile) {
    $Content = Get-Content $ServiceFile -Raw
    
    if ($Content -match "WalletService") {
        Write-Host "  [OK] WalletService imported" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  [FAIL] WalletService NOT imported" -ForegroundColor Red
        $TestsFailed++
    }
    
    if ($Content -match "walletService\.addBalance") {
        Write-Host "  [OK] Refund logic implemented" -ForegroundColor Green
        $TestsPassed++
    } else {
        Write-Host "  [FAIL] Refund logic NOT implemented" -ForegroundColor Red
        $TestsFailed++
    }
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed: $TestsPassed" -ForegroundColor Green
Write-Host "Failed: $TestsFailed" -ForegroundColor Red
Write-Host ""

if ($TestsFailed -eq 0) {
    Write-Host "All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed. Please review." -ForegroundColor Yellow
    exit 1
}
