# 🗄️ Archived Migration Scripts

**Tarih:** 11 Kasım 2025  
**Sebep:** Sprint 1 - Duplicate & Deprecated Cleanup

Bu klasördeki script'ler artık kullanılmıyor. Deprecated `@/lib/shared/utils/logger` path'ini referans alıyorlar.

## Arşivlenen Dosyalar

### 1. `clean-console.js`

- **Amaç:** Console.log kullanımlarını tespit ve temizleme
- **Durum:** Deprecated logger path kullanıyor
- **Alternatif:** `clean-logger-pattern.ps1` (güncel)

### 2. `fix-console-usage.js`

- **Amaç:** Console kullanımlarını logger'a dönüştürme
- **Durum:** Deprecated logger path kullanıyor
- **Alternatif:** `migrate-console-to-logger.ps1` (güncel)

### 3. `migrate-logger.js`

- **Amaç:** Logger path migration
- **Durum:** İşini tamamladı, artık gerekli değil
- **Sonuç:** Tüm dosyalar production logger kullanıyor

### 4. `add-logger-imports.ps1`

- **Amaç:** Logger import ekleme
- **Durum:** Deprecated path kullanıyor
- **Alternatif:** Manuel import veya IDE auto-import

## Production-Ready Alternatifler

### Aktif Script'ler

✅ `scripts/clean-logger-pattern.ps1` - Verbose pattern temizleme  
✅ `scripts/migrate-console-to-logger.ps1` - Console → Logger migration

### Kullanım

```powershell
# Logger pattern cleanup
powershell -ExecutionPolicy Bypass -File scripts\clean-logger-pattern.ps1

# Console migration
powershell -ExecutionPolicy Bypass -File scripts\migrate-console-to-logger.ps1
```

---

**Not:** Bu dosyalar gelecekte referans için saklanıyor. Production'da kullanılmamalı.
