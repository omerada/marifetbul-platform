# PowerShell script to add logger import to files using console.*

$files = @(
    "app\admin\payouts\page.tsx",
    "app\admin\moderation\reviews\page-v2.tsx",
    "app\marketplace\categories\[categoryId]\[subcategoryId]\page.tsx",
    "app\dashboard\freelancer\reviews\page.tsx",
    "app\dashboard\freelancer\wallet\transactions\page.tsx",
    "app\dashboard\freelancer\wallet\bank-accounts\page.tsx",
    "app\dashboard\reviews\page.tsx",
    "app\checkout\confirmation\[orderId]\page.tsx",
    "app\dashboard\employer\reviews\page.tsx",
    "components\providers\StripeProvider.tsx",
    "components\shared\ImageUpload.tsx",
    "components\shared\ReviewForm.tsx",
    "components\shared\ApiErrorBoundary.tsx",
    "components\packages\detail\PackageDetailContainer.tsx",
    "components\packages\public\OrderModal.tsx",
    "components\packages\public\PublicPackageDetailContainer.tsx",
    "components\packages\public\MarketplaceFilters.tsx",
    "components\packages\public\PublicPackageDetail.tsx",
    "components\packages\public\MarketplaceContainer.tsx",
    "components\packages\edit\PackageEditContainer.tsx",
    "components\packages\public\FeaturedPackages.tsx",
    "components\packages\list\PackageListContainer.tsx",
    "components\admin\payouts\AdminUserWalletModal.tsx",
    "components\admin\payouts\AdminPayoutDetailModal.tsx",
    "components\admin\dashboard\CommentModerationSummary.tsx",
    "components\domains\reviews\ReviewFormModal.tsx",
    "components\domains\reviews\ReviewVoting.tsx",
    "components\domains\messaging\QuickMessageModal.tsx",
    "components\domains\messaging\MessagesList.tsx",
    "components\dashboard\PackageAnalytics.tsx",
    "components\dashboard\freelancer\wallet\PayoutRequestModal.tsx",
    "components\domains\admin\AdminReviewStatsWidget.tsx"
)

$loggerImport = "import { logger } from '@/lib/shared/utils/logger';"
$count = 0

foreach ($file in $files) {
    $fullPath = Join-Path $PSScriptRoot "..\$file"
    
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Check if logger is already imported
        if ($content -notmatch "import.*logger.*from.*@/lib/shared/utils/logger") {
            # Find the last import statement
            $lines = $content -split "`n"
            $lastImportIndex = -1
            
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match "^import\s") {
                    $lastImportIndex = $i
                }
            }
            
            if ($lastImportIndex -ge 0) {
                # Insert logger import after the last import
                $lines = $lines[0..$lastImportIndex] + $loggerImport + $lines[($lastImportIndex + 1)..($lines.Count - 1)]
                $newContent = $lines -join "`n"
                
                Set-Content -Path $fullPath -Value $newContent -NoNewline
                Write-Host "✓ Added logger import to: $file" -ForegroundColor Green
                $count++
            }
        } else {
            Write-Host "- Logger already imported in: $file" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nProcessed $count files" -ForegroundColor Cyan
Write-Host "Note: You still need to replace console.* calls with logger.* calls manually or with find-replace" -ForegroundColor Cyan
