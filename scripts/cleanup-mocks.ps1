# PowerShell Script: Mock Data ve Test Utilities Temizliği
# Usage: .\scripts\cleanup-mocks.ps1

Write-Host "🧹 Mock Data ve Test Utilities Temizliği Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# 1. Mock data içeren dosyaları tespit et
Write-Host "📋 Step 1: Mock data içeren dosyaları tespit ediliyor..." -ForegroundColor Yellow
$mockFiles = @()

Get-ChildItem -Path . -Recurse -Include *.ts,*.tsx -Exclude node_modules,dist,.next,build | 
    Select-String -Pattern "mock|Mock|MOCK" -SimpleMatch | 
    ForEach-Object { 
        $mockFiles += $_.Path
    } | Select-Object -Unique

Write-Host "✅ $($mockFiles.Count) dosyada mock data bulundu" -ForegroundColor Green
$mockFiles | Out-File -FilePath "mock-files-report.txt"
Write-Host "   Rapor kaydedildi: mock-files-report.txt" -ForegroundColor Gray
Write-Host ""

# 2. Legacy API routes'ları tespit et
Write-Host "📋 Step 2: Legacy API routes kontrol ediliyor..." -ForegroundColor Yellow
$legacyPath = "app\api\legacy"
if (Test-Path $legacyPath) {
    Write-Host "⚠️  Legacy routes bulundu: $legacyPath" -ForegroundColor Red
    Get-ChildItem -Path $legacyPath -Recurse -Include *.ts | ForEach-Object {
        Write-Host "   - $($_.FullName)" -ForegroundColor Gray
    }
    
    $response = Read-Host "Bu legacy routes'ları silmek ister misiniz? (y/n)"
    if ($response -eq "y") {
        Remove-Item -Path $legacyPath -Recurse -Force
        Write-Host "✅ Legacy routes silindi" -ForegroundColor Green
    } else {
        Write-Host "⏭️  Legacy routes korundu" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Legacy routes bulunamadı" -ForegroundColor Green
}
Write-Host ""

# 3. Test utilities'i test klasörüne taşı
Write-Host "📋 Step 3: Test utilities'i organize ediliyor..." -ForegroundColor Yellow
$testUtilsPath = "lib\shared\testing"
$targetPath = "__tests__\utilities"

if (Test-Path $testUtilsPath) {
    Write-Host "⚠️  Test utilities bulundu: $testUtilsPath" -ForegroundColor Red
    
    $response = Read-Host "Test utilities'i $targetPath klasörüne taşımak ister misiniz? (y/n)"
    if ($response -eq "y") {
        if (-not (Test-Path $targetPath)) {
            New-Item -Path $targetPath -ItemType Directory -Force | Out-Null
        }
        
        Get-ChildItem -Path $testUtilsPath -Recurse | ForEach-Object {
            $dest = $_.FullName.Replace($testUtilsPath, $targetPath)
            $destDir = Split-Path $dest -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -Path $destDir -ItemType Directory -Force | Out-Null
            }
            Copy-Item -Path $_.FullName -Destination $dest -Force
        }
        
        Remove-Item -Path $testUtilsPath -Recurse -Force
        Write-Host "✅ Test utilities taşındı" -ForegroundColor Green
        Write-Host "   Yeni konum: $targetPath" -ForegroundColor Gray
    } else {
        Write-Host "⏭️  Test utilities korundu" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Test utilities zaten organize edilmiş" -ForegroundColor Green
}
Write-Host ""

# 4. Mock packages route'unu kontrol et
Write-Host "📋 Step 4: Mock packages API route kontrol ediliyor..." -ForegroundColor Yellow
$packagesRoute = "app\api\v1\packages\route.ts"
if (Test-Path $packagesRoute) {
    $content = Get-Content $packagesRoute -Raw
    if ($content -match "mockPackages") {
        Write-Host "⚠️  Mock packages data bulundu: $packagesRoute" -ForegroundColor Red
        Write-Host "   ⚡ Manuel olarak backend endpoint'e geçirilmeli" -ForegroundColor Yellow
        Write-Host "   Örnek kod için PRODUCTION_READINESS_ANALYSIS.md'ye bakın" -ForegroundColor Gray
    } else {
        Write-Host "✅ Packages route temiz" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Packages route bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

# 5. Auth utilities mock implementation'ını kontrol et
Write-Host "📋 Step 5: Auth utilities mock implementation kontrol ediliyor..." -ForegroundColor Yellow
$authUtils = "lib\shared\utils\auth.ts"
if (Test-Path $authUtils) {
    $content = Get-Content $authUtils -Raw
    if ($content -match "Mock implementation") {
        Write-Host "⚠️  Mock JWT decode bulundu: $authUtils" -ForegroundColor Red
        Write-Host "   ⚡ JWT decode düzgün implement edilmeli" -ForegroundColor Yellow
        Write-Host "   Örnek kod için PRODUCTION_READINESS_ANALYSIS.md'ye bakın" -ForegroundColor Gray
    } else {
        Write-Host "✅ Auth utilities temiz" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Auth utilities bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

# 6. Component'lerdeki mock data'yı tespit et
Write-Host "📋 Step 6: Component'lerdeki mock data tespit ediliyor..." -ForegroundColor Yellow
$componentMocks = @(
    "components\shared\utilities\LocationPicker.tsx",
    "components\shared\utilities\MapView.tsx",
    "components\domains\search\UniversalSearch.tsx",
    "components\domains\search\SearchAutocomplete.tsx"
)

$foundMocks = @()
foreach ($file in $componentMocks) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        if ($content -match "mock") {
            $foundMocks += $file
        }
    }
}

if ($foundMocks.Count -gt 0) {
    Write-Host "⚠️  $($foundMocks.Count) component'te mock data bulundu:" -ForegroundColor Red
    $foundMocks | ForEach-Object {
        Write-Host "   - $_" -ForegroundColor Gray
    }
    Write-Host "   ⚡ Bu component'ler backend API'leriyle güncellenmelidir" -ForegroundColor Yellow
} else {
    Write-Host "✅ Component'ler temiz" -ForegroundColor Green
}
Write-Host ""

# Özet
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📊 ÖZET" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Temizlik işlemi tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Sonraki Adımlar:" -ForegroundColor Yellow
Write-Host "   1. mock-files-report.txt dosyasını inceleyin" -ForegroundColor White
Write-Host "   2. PRODUCTION_READINESS_ANALYSIS.md'deki önerileri uygulayın" -ForegroundColor White
Write-Host "   3. Manuel cleanup gereken dosyaları güncelleyin" -ForegroundColor White
Write-Host "   4. Test suite'i çalıştırın: npm test" -ForegroundColor White
Write-Host "   5. Build test edin: npm run build" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Önemli: Değişiklikleri commit etmeden önce test edin!" -ForegroundColor Red
Write-Host ""
