# Fix order type imports across all components
# This script updates Order type to OrderWithComputed and adds unwrapOrderResponse/enrichOrder

$files = @(
    "components/dashboard/orders/ApproveDeliveryModal.tsx",
    "components/dashboard/orders/CancelOrderModal.tsx",
    "components/dashboard/orders/DeliverySubmissionModal.tsx",
    "components/dashboard/orders/OrderActions.tsx",
    "components/dashboard/orders/OrderCard.tsx"
)

foreach ($file in $files) {
    $filePath = "c:\Projects\marifeto\$file"
    
    if (Test-Path $filePath) {
        Write-Host "Fixing $file..." -ForegroundColor Yellow
        
        $content = Get-Content $filePath -Raw
        
        # Replace Order import with OrderWithComputed
        $content = $content -replace "import type \{ Order \} from '@/lib/api/validators/order';", "import { enrichOrder, unwrapOrderResponse, type OrderWithComputed, type OrderResponse } from '@/lib/api/orders';"
        $content = $content -replace "import \{ orderApi \} from '@/lib/api/orders';", "import { orderApi, enrichOrder, unwrapOrderResponse, type OrderWithComputed, type OrderResponse } from '@/lib/api/orders';"
        
        # Replace Order type with OrderWithComputed in type annotations
        $content = $content -replace "\bOrder\b(?!Response|Summary|WithComputed|Statistics|Event|Status|Type|Filters|Card|Actions|List)", "OrderWithComputed"
        
        # Replace ApiResponse unwrapping patterns
        $content = $content -replace "const (\w+) = await orderApi\.(\w+)\(", 'const response_$1 = await orderApi.$2('
        $content = $content -replace "response_(\w+);", 'unwrapOrderResponse(response_$1));'
        
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`nDone! Run 'npm run type-check' to verify." -ForegroundColor Cyan
