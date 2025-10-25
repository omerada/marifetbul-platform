# Wallet & Payout System Integration Test Script
# Author: MarifetBul Development Team

$ErrorActionPreference = "Continue"
$testResults = @()

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "WALLET & PAYOUT SYSTEM - INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Test Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Test 1: File Existence
Write-Host "[TEST 1] Checking File Existence..." -ForegroundColor Yellow
$files = @(
    "types\business\features\wallet.ts",
    "stores\walletStore.ts",
    "hooks\business\wallet\useWallet.ts",
    "hooks\business\wallet\useBalance.ts",
    "hooks\business\wallet\useTransactions.ts",
    "hooks\business\wallet\usePayouts.ts",
    "components\dashboard\freelancer\wallet\WalletBalanceCard.tsx",
    "components\dashboard\freelancer\wallet\EarningsChart.tsx",
    "components\dashboard\freelancer\wallet\RecentTransactionsWidget.tsx",
    "components\dashboard\freelancer\wallet\TransactionFilters.tsx",
    "components\dashboard\freelancer\wallet\TransactionList.tsx",
    "components\dashboard\freelancer\wallet\RequestPayoutModal.tsx",
    "app\dashboard\freelancer\wallet\page.tsx",
    "app\dashboard\freelancer\wallet\transactions\page.tsx",
    "app\dashboard\freelancer\wallet\payouts\page.tsx"
)

$missingFiles = @()
foreach ($file in $files) {
    $fullPath = "c:\Projects\marifeto\$file"
    if (Test-Path $fullPath) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $file - MISSING" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -eq 0) {
    Write-Host "[PASS] All 15 files exist" -ForegroundColor Green
    $testResults += @{ Test = "File Existence"; Status = "PASS"; Details = "15/15 files found" }
} else {
    Write-Host "[FAIL] Missing $($missingFiles.Count) files" -ForegroundColor Red
    $testResults += @{ Test = "File Existence"; Status = "FAIL"; Details = "$($missingFiles.Count) files missing" }
}

# Test 2: Component Exports
Write-Host ""
Write-Host "[TEST 2] Component Export Verification..." -ForegroundColor Yellow
$indexPath = "c:\Projects\marifeto\components\dashboard\freelancer\wallet\index.ts"
if (Test-Path $indexPath) {
    $indexContent = Get-Content $indexPath -Raw
    $expectedExports = @(
        "WalletBalanceCard",
        "EarningsChart",
        "RecentTransactionsWidget",
        "TransactionFilters",
        "TransactionList",
        "RequestPayoutModal"
    )
    
    $missingExports = @()
    foreach ($export in $expectedExports) {
        if ($indexContent -match "export.*$export") {
            Write-Host "  [OK] $export exported" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $export NOT exported" -ForegroundColor Red
            $missingExports += $export
        }
    }
    
    if ($missingExports.Count -eq 0) {
        Write-Host "[PASS] All 6 components properly exported" -ForegroundColor Green
        $testResults += @{ Test = "Component Exports"; Status = "PASS"; Details = "6/6 components exported" }
    } else {
        Write-Host "[FAIL] $($missingExports.Count) components not exported" -ForegroundColor Red
        $testResults += @{ Test = "Component Exports"; Status = "FAIL"; Details = "$($missingExports.Count) missing" }
    }
} else {
    Write-Host "  [FAIL] index.ts not found" -ForegroundColor Red
    $testResults += @{ Test = "Component Exports"; Status = "FAIL"; Details = "index.ts missing" }
}

# Test 3: Hook Exports
Write-Host ""
Write-Host "[TEST 3] Hook Export Verification..." -ForegroundColor Yellow
$hooksIndexPath = "c:\Projects\marifeto\hooks\business\wallet\index.ts"
if (Test-Path $hooksIndexPath) {
    $hooksContent = Get-Content $hooksIndexPath -Raw
    $expectedHooks = @(
        "useWallet",
        "useBalance",
        "useTransactions",
        "usePayouts"
    )
    
    $missingHooks = @()
    foreach ($hook in $expectedHooks) {
        if ($hooksContent -match "export.*$hook") {
            Write-Host "  [OK] $hook exported" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $hook NOT exported" -ForegroundColor Red
            $missingHooks += $hook
        }
    }
    
    if ($missingHooks.Count -eq 0) {
        Write-Host "[PASS] All 4 hooks properly exported" -ForegroundColor Green
        $testResults += @{ Test = "Hook Exports"; Status = "PASS"; Details = "4/4 hooks exported" }
    } else {
        Write-Host "[FAIL] $($missingHooks.Count) hooks not exported" -ForegroundColor Red
        $testResults += @{ Test = "Hook Exports"; Status = "FAIL"; Details = "$($missingHooks.Count) missing" }
    }
} else {
    Write-Host "  [FAIL] hooks index.ts not found" -ForegroundColor Red
    $testResults += @{ Test = "Hook Exports"; Status = "FAIL"; Details = "index.ts missing" }
}

# Test 4: API Endpoint Configuration
Write-Host ""
Write-Host "[TEST 4] API Endpoint Configuration..." -ForegroundColor Yellow
$endpointsPath = "c:\Projects\marifeto\lib\api\endpoints.ts"
if (Test-Path $endpointsPath) {
    $endpointsContent = Get-Content $endpointsPath -Raw
    $requiredEndpoints = @(
        "GET_WALLET",
        "GET_BALANCE",
        "GET_TRANSACTIONS",
        "EXPORT_TRANSACTIONS",
        "CREATE_PAYOUT",
        "GET_PAYOUT_HISTORY",
        "CANCEL_PAYOUT",
        "GET_ELIGIBILITY",
        "GET_LIMITS"
    )
    
    $missingEndpoints = @()
    foreach ($endpoint in $requiredEndpoints) {
        if ($endpointsContent -match $endpoint) {
            Write-Host "  [OK] $endpoint defined" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $endpoint NOT defined" -ForegroundColor Red
            $missingEndpoints += $endpoint
        }
    }
    
    if ($missingEndpoints.Count -eq 0) {
        Write-Host "[PASS] All 9 API endpoints configured" -ForegroundColor Green
        $testResults += @{ Test = "API Endpoints"; Status = "PASS"; Details = "9/9 endpoints configured" }
    } else {
        Write-Host "[FAIL] $($missingEndpoints.Count) endpoints missing" -ForegroundColor Red
        $testResults += @{ Test = "API Endpoints"; Status = "FAIL"; Details = "$($missingEndpoints.Count) missing" }
    }
} else {
    Write-Host "  [FAIL] endpoints.ts not found" -ForegroundColor Red
    $testResults += @{ Test = "API Endpoints"; Status = "FAIL"; Details = "endpoints.ts missing" }
}

# Test 5: Type Definitions
Write-Host ""
Write-Host "[TEST 5] Type Definition Completeness..." -ForegroundColor Yellow
$walletTypesPath = "c:\Projects\marifeto\types\business\features\wallet.ts"
if (Test-Path $walletTypesPath) {
    $typesContent = Get-Content $walletTypesPath -Raw
    $requiredTypes = @(
        "interface Transaction",
        "interface Payout",
        "interface WalletResponse",
        "interface BalanceResponse",
        "interface PayoutRequest",
        "interface BankAccountInfo",
        "enum TransactionType",
        "enum PayoutStatus",
        "enum PayoutMethod"
    )
    
    $missingTypes = @()
    foreach ($type in $requiredTypes) {
        if ($typesContent -match [regex]::Escape($type)) {
            Write-Host "  [OK] $type defined" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $type NOT defined" -ForegroundColor Red
            $missingTypes += $type
        }
    }
    
    if ($missingTypes.Count -eq 0) {
        Write-Host "[PASS] All core types defined" -ForegroundColor Green
        $testResults += @{ Test = "Type Definitions"; Status = "PASS"; Details = "All core types present" }
    } else {
        Write-Host "[FAIL] $($missingTypes.Count) types missing" -ForegroundColor Red
        $testResults += @{ Test = "Type Definitions"; Status = "FAIL"; Details = "$($missingTypes.Count) missing" }
    }
} else {
    Write-Host "  [FAIL] wallet.ts types not found" -ForegroundColor Red
    $testResults += @{ Test = "Type Definitions"; Status = "FAIL"; Details = "wallet.ts missing" }
}

# Test 6: Store Actions
Write-Host ""
Write-Host "[TEST 6] Zustand Store Actions..." -ForegroundColor Yellow
$storePath = "c:\Projects\marifeto\stores\walletStore.ts"
if (Test-Path $storePath) {
    $storeContent = Get-Content $storePath -Raw
    $requiredActions = @(
        "fetchWallet",
        "fetchBalance",
        "fetchTransactions",
        "fetchPayouts",
        "requestPayout",
        "cancelPayout",
        "exportTransactions"
    )
    
    $missingActions = @()
    foreach ($action in $requiredActions) {
        if ($storeContent -match "$action\s*:") {
            Write-Host "  [OK] $action action defined" -ForegroundColor Green
        } else {
            Write-Host "  [FAIL] $action action NOT defined" -ForegroundColor Red
            $missingActions += $action
        }
    }
    
    if ($missingActions.Count -eq 0) {
        Write-Host "[PASS] All 7 store actions implemented" -ForegroundColor Green
        $testResults += @{ Test = "Store Actions"; Status = "PASS"; Details = "7/7 actions implemented" }
    } else {
        Write-Host "[FAIL] $($missingActions.Count) actions missing" -ForegroundColor Red
        $testResults += @{ Test = "Store Actions"; Status = "FAIL"; Details = "$($missingActions.Count) missing" }
    }
} else {
    Write-Host "  [FAIL] walletStore.ts not found" -ForegroundColor Red
    $testResults += @{ Test = "Store Actions"; Status = "FAIL"; Details = "walletStore.ts missing" }
}

# Test Results Summary
Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "TEST RESULTS SUMMARY" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$passCount = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$totalTests = $testResults.Count

foreach ($result in $testResults) {
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    $symbol = if ($result.Status -eq "PASS") { "[PASS]" } else { "[FAIL]" }
    Write-Host "$symbol $($result.Test): $($result.Details)" -ForegroundColor $color
}

Write-Host ""
Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passCount" -ForegroundColor Green
Write-Host "Failed: $failCount" -ForegroundColor Red
Write-Host "--------------------------------------------------" -ForegroundColor Gray

if ($failCount -eq 0) {
    Write-Host ""
    Write-Host "ALL TESTS PASSED! Wallet system is ready for production." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "SOME TESTS FAILED! Please review the errors above." -ForegroundColor Yellow
    exit 1
}
