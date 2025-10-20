#!/usr/bin/env pwsh
# Docker Compose Backend Yönetim Scripti
# Kullanım: .\manage-backend.ps1 [action] [options]

param(
    [Parameter(Position = 0)]
    [ValidateSet('start', 'stop', 'restart', 'rebuild', 'logs', 'ps', 'clean')]
    [string]$Action = 'start',
    
    [Parameter(Position = 1)]
    [ValidateSet('backend', 'all')]
    [string]$Target = 'all',
    
    [switch]$NoCache,
    [switch]$Follow
)

# Renkli output
function Write-Success { Write-Host $args[0] -ForegroundColor Green }
function Write-Error-Colored { Write-Host $args[0] -ForegroundColor Red }
function Write-Info { Write-Host $args[0] -ForegroundColor Cyan }
function Write-Warning-Colored { Write-Host $args[0] -ForegroundColor Yellow }

# Backend klasörüne git
Set-Location marifetbul-backend

Write-Info "🐳 Docker Compose Backend Yönetim Scripti"
Write-Info "========================================="
Write-Info "Action: $Action | Target: $Target"
Write-Info ""

switch ($Action) {
    'start' {
        Write-Info "🚀 Backend başlatılıyor..."
        
        if ($Target -eq 'all') {
            Write-Warning-Colored "⏳ Tüm servisleri başlatıyorum (PostgreSQL, Redis, Elasticsearch, Backend)..."
            docker-compose up -d
        }
        else {
            Write-Warning-Colored "⏳ Sadece backend başlatılıyor..."
            docker-compose up -d backend
        }
        
        Write-Success "✅ Backend başlatıldı!"
        Write-Info ""
        Write-Info "📊 Servis Durumu:"
        docker-compose ps
        
        Write-Info ""
        Write-Info "🔍 Health Check (5 saniye sonra):"
        Start-Sleep -Seconds 5
        
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -ErrorAction SilentlyContinue
            Write-Success "✅ Backend sağlıklı: $($health.status)"
        }
        catch {
            Write-Warning-Colored "⚠️ Backend henüz hazır değilse dener:"
            Write-Info "docker-compose logs -f backend"
        }
    }
    
    'stop' {
        Write-Warning-Colored "🛑 Servisleri durduruluyor..."
        
        if ($Target -eq 'all') {
            Write-Info "Tüm servisleri durduruluyor..."
            docker-compose down
        }
        else {
            Write-Info "Sadece backend durduruluyor..."
            docker-compose stop backend
        }
        
        Write-Success "✅ Servisleri durduruldu!"
    }
    
    'restart' {
        Write-Info "🔄 Servisleri yeniden başlatılıyor..."
        
        if ($Target -eq 'all') {
            Write-Info "Tüm servisleri yeniden başlatılıyor..."
            docker-compose restart
        }
        else {
            Write-Info "Sadece backend yeniden başlatılıyor..."
            docker-compose restart backend
        }
        
        Write-Success "✅ Servisleri yeniden başlatıldı!"
        
        Start-Sleep -Seconds 3
        Write-Info ""
        Write-Info "📊 Servis Durumu:"
        docker-compose ps
    }
    
    'rebuild' {
        Write-Info "🔨 Backend rebuild ediliyor..."
        
        $noCacheFlag = if ($NoCache) { "--no-cache" } else { "" }
        
        Write-Warning-Colored "1️⃣  Eski container durdurulup kaldırılıyor..."
        docker-compose down
        
        Write-Warning-Colored "2️⃣  Backend rebuild ediliyor..."
        if ($noCacheFlag) {
            Write-Warning-Colored "   (Cache kullanılmıyor - temiz build)"
            docker-compose build --no-cache backend
        }
        else {
            docker-compose build backend
        }
        
        Write-Warning-Colored "3️⃣  Backend başlatılıyor..."
        docker-compose up -d backend
        
        Start-Sleep -Seconds 3
        Write-Success "✅ Backend rebuild tamamlandı!"
        
        Write-Info ""
        Write-Info "📊 Servis Durumu:"
        docker-compose ps
    }
    
    'logs' {
        Write-Info "📋 Loglar gösteriliyor..."
        Write-Info ""
        
        $followFlag = if ($Follow -or $PSBoundParameters['Follow']) { "-f" } else { "--tail=50" }
        
        docker-compose logs $followFlag backend
    }
    
    'ps' {
        Write-Info "📊 Servis Durumları:"
        Write-Info ""
        docker-compose ps
        
        Write-Info ""
        Write-Info "🔍 Health Checks:"
        Write-Info ""
        
        # Backend health
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method Get -ErrorAction SilentlyContinue
            Write-Success "  ✅ Backend: $($health.status)"
        }
        catch {
            Write-Error-Colored "  ❌ Backend: Bağlanamadı"
        }
        
        # PostgreSQL health
        $pgCheck = docker-compose exec postgres pg_isready -U postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✅ PostgreSQL: Ready"
        }
        else {
            Write-Error-Colored "  ❌ PostgreSQL: Not ready"
        }
        
        # Redis health
        $redisCheck = docker-compose exec redis redis-cli -a redis123 ping 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "  ✅ Redis: Ready"
        }
        else {
            Write-Error-Colored "  ❌ Redis: Not ready"
        }
    }
    
    'clean' {
        Write-Warning-Colored "🧹 Temizlik yapılıyor..."
        Write-Warning-Colored "   (Tüm servisleri durdur, container'ları kaldır, volume'leri sil)"
        Write-Warning-Colored ""
        Write-Warning-Colored "❌ UYARI: Veriler silinecek! Devam etmek istediğinizden emin misiniz?"
        Write-Warning-Colored "   Yazın: 'evet' (Türkçe) veya 'yes' (İngilizce)"
        
        $confirm = Read-Host "Devam et? [evet/yes]"
        
        if ($confirm -eq 'evet' -or $confirm -eq 'yes') {
            Write-Warning-Colored "🧹 Siliniyor..."
            docker-compose down -v
            Write-Success "✅ Temizlik tamamlandı!"
        }
        else {
            Write-Info "❌ İptal edildi"
        }
    }
}

Write-Info ""
Write-Info "✨ İşlem tamamlandı!"
