# PowerShell Script: Environment Variables Setup
# Usage: .\scripts\setup-env.ps1

Write-Host "🔧 Environment Variables Setup Başlatılıyor..." -ForegroundColor Cyan
Write-Host ""

# 1. Frontend .env.local oluştur
Write-Host "📋 Step 1: Frontend .env.local kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.example") {
        Copy-Item -Path ".env.example" -Destination ".env.local"
        Write-Host "✅ .env.local oluşturuldu (.env.example'dan)" -ForegroundColor Green
        Write-Host "   ⚠️  Lütfen .env.local'i kendi değerlerinizle güncelleyin" -ForegroundColor Yellow
    } else {
        Write-Host "❌ .env.example bulunamadı!" -ForegroundColor Red
        Write-Host "   Manuel olarak .env.local oluşturun" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ .env.local zaten mevcut" -ForegroundColor Green
}
Write-Host ""

# 2. Backend .env oluştur
Write-Host "📋 Step 2: Backend .env kontrol ediliyor..." -ForegroundColor Yellow
$backendEnvPath = "marifetbul-backend\.env"

if (-not (Test-Path $backendEnvPath)) {
    Write-Host "⚠️  Backend .env bulunamadı, oluşturuluyor..." -ForegroundColor Yellow
    
    # Generate secure JWT secret
    $jwtSecret = [Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
    
    $envContent = @"
# Backend Environment Variables
# GENERATED: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Spring Profile
SPRING_PROFILES_ACTIVE=dev

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=marifetbul_dev
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (Auto-generated secure secret)
JWT_SECRET=$jwtSecret
JWT_EXPIRATION=86400000
JWT_REFRESH_EXPIRATION=604800000

# Email (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key-here
EMAIL_FROM=noreply@marifetbul.com
EMAIL_FROM_NAME=MarifetBul

# Payment (Iyzico)
IYZICO_API_KEY=your-iyzico-api-key-here
IYZICO_SECRET_KEY=your-iyzico-secret-key-here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# AWS S3 (Development - LocalStack)
AWS_S3_BUCKET=marifetbul-dev
AWS_REGION=eu-central-1
AWS_ENDPOINT=http://localhost:4566
AWS_ACCESS_KEY=test
AWS_SECRET_KEY=test

# Elasticsearch
ELASTICSEARCH_URIS=http://localhost:9200
ELASTICSEARCH_USERNAME=
ELASTICSEARCH_PASSWORD=

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
CORS_ALLOW_CREDENTIALS=true

# Monitoring
SENTRY_DSN=

# Server
SERVER_PORT=8080
"@
    
    $envContent | Out-File -FilePath $backendEnvPath -Encoding UTF8
    Write-Host "✅ Backend .env oluşturuldu" -ForegroundColor Green
    Write-Host "   📍 Konum: $backendEnvPath" -ForegroundColor Gray
    Write-Host "   🔑 JWT Secret otomatik oluşturuldu" -ForegroundColor Green
    Write-Host "   ⚠️  Lütfen API keys'leri gerçek değerlerle güncelleyin" -ForegroundColor Yellow
} else {
    Write-Host "✅ Backend .env zaten mevcut" -ForegroundColor Green
}
Write-Host ""

# 3. Production environment template'i kontrol et
Write-Host "📋 Step 3: Production environment template kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".env.production.example") {
    Write-Host "✅ Production template mevcut: .env.production.example" -ForegroundColor Green
    Write-Host "   📝 Vercel'de aşağıdaki değişkenleri set edin:" -ForegroundColor Yellow
    Write-Host ""
    
    $prodVars = @(
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_APP_URL",
        "NEXT_PUBLIC_SENTRY_DSN",
        "NEXT_PUBLIC_ENABLE_ANALYTICS"
    )
    
    foreach ($var in $prodVars) {
        Write-Host "      - $var" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Production template bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

# 4. Backend production config kontrol
Write-Host "📋 Step 4: Backend production config kontrol ediliyor..." -ForegroundColor Yellow
$prodYml = "marifetbul-backend\src\main\resources\application-prod.yml"
if (Test-Path $prodYml) {
    Write-Host "✅ Backend production config mevcut: application-prod.yml" -ForegroundColor Green
    Write-Host "   ⚠️  Production deployment'ta environment variables set edilmeli" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Backend production config bulunamadı" -ForegroundColor Yellow
}
Write-Host ""

# 5. .gitignore kontrol
Write-Host "📋 Step 5: .gitignore kontrol ediliyor..." -ForegroundColor Yellow
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    
    $requiredIgnores = @(".env.local", ".env", "*.env")
    $missingIgnores = @()
    
    foreach ($ignore in $requiredIgnores) {
        if ($gitignoreContent -notmatch [regex]::Escape($ignore)) {
            $missingIgnores += $ignore
        }
    }
    
    if ($missingIgnores.Count -gt 0) {
        Write-Host "⚠️  .gitignore'da eksik kurallar bulundu:" -ForegroundColor Yellow
        $missingIgnores | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Gray
        }
        
        $response = Read-Host "Bu kuralları eklemek ister misiniz? (y/n)"
        if ($response -eq "y") {
            Add-Content -Path ".gitignore" -Value "`n# Environment variables (auto-added)"
            $missingIgnores | ForEach-Object {
                Add-Content -Path ".gitignore" -Value $_
            }
            Write-Host "✅ .gitignore güncellendi" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ .gitignore temiz" -ForegroundColor Green
    }
} else {
    Write-Host "❌ .gitignore bulunamadı!" -ForegroundColor Red
}
Write-Host ""

# 6. Environment değişkenlerini doğrula
Write-Host "📋 Step 6: Environment değişkenleri doğrulanıyor..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    $requiredVars = @(
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_APP_URL"
    )
    
    $missingVars = @()
    foreach ($var in $requiredVars) {
        if ($envContent -notmatch $var) {
            $missingVars += $var
        }
    }
    
    if ($missingVars.Count -gt 0) {
        Write-Host "⚠️  .env.local'de eksik değişkenler:" -ForegroundColor Yellow
        $missingVars | ForEach-Object {
            Write-Host "   - $_" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ Gerekli environment değişkenleri mevcut" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  .env.local bulunamadı, doğrulama yapılamadı" -ForegroundColor Yellow
}
Write-Host ""

# Özet
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "📊 ÖZET" -ForegroundColor Cyan
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Environment setup tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Oluşturulan/Kontrol Edilen Dosyalar:" -ForegroundColor Yellow
Write-Host "   ✓ .env.local (Frontend)" -ForegroundColor White
Write-Host "   ✓ marifetbul-backend\.env (Backend)" -ForegroundColor White
Write-Host "   ✓ .gitignore" -ForegroundColor White
Write-Host ""
Write-Host "📋 Sonraki Adımlar:" -ForegroundColor Yellow
Write-Host "   1. .env.local'i kendi değerlerinizle güncelleyin" -ForegroundColor White
Write-Host "   2. marifetbul-backend\.env'de API keys'leri güncelleyin" -ForegroundColor White
Write-Host "   3. PostgreSQL ve Redis'i başlatın" -ForegroundColor White
Write-Host "   4. Backend'i çalıştırın: cd marifetbul-backend && mvn spring-boot:run" -ForegroundColor White
Write-Host "   5. Frontend'i çalıştırın: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Önemli: .env dosyalarını ASLA commit etmeyin!" -ForegroundColor Red
Write-Host "⚠️  Production'da Vercel environment variables kullanın!" -ForegroundColor Red
Write-Host ""
