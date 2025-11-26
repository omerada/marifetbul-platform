# 🚀 MarifetBul - Hızlı Başlangıç Rehberi

**Son Güncelleme:** 26 Kasım 2025  
**Hedef Kitle:** Development Team

---

## ⚡ 5 Dakikada Başla

### Adım 1: Raporları İncele (5 dk)

```bash
# Ana raporlar
1. EXECUTIVE_SUMMARY.md     # Özet ve öneriler (ÖNCELİKLE BU!)
2. ANALIZ_RAPORU.md         # Detaylı teknik analiz
3. SPRINT_BACKLOG.md        # Sprint planları
```

### Adım 2: Durumu Anla (2 dk)

**Sistem Durumu:**

```yaml
✅ Production Ready: YES
✅ Code Quality: Excellent (A)
✅ Test Coverage: Good (40-70%)
✅ Performance: Excellent (90+ Lighthouse)
⚠️ Minor Issues: 5 (düşük etki)
```

**Ana Mesaj:**

> Sistem sağlam ve production'a hazır. Tespit edilen 5 eksiklik kritik değil ve normal development cycle'ı içinde çözülebilir.

### Adım 3: Önceliklere Karar Ver (3 dk)

**3 Seçenek:**

```bash
Seçenek 1: Minimal (2-3 gün)
  └─ Sadece kritik: Escrow Details Endpoint
  └─ Effort: 2 SP
  └─ En hızlı çözüm

Seçenek 2: Balanced (1 hafta) ⭐ ÖNERİLEN
  └─ Sprint 1: Quality & Cleanup
  └─ Effort: 5 SP
  └─ Best ROI

Seçenek 3: Comprehensive (3 hafta)
  └─ 3 Sprint: Quality + Features
  └─ Effort: 18 SP
  └─ Maximum value
```

---

## 🎯 Öncelikli İşler (P0)

### 1. Escrow Details Endpoint (CRITICAL)

**Problem:**

- Frontend hook hazır: `useEscrowDetails`
- Backend endpoint yok: `/api/v1/wallet/escrow-details`
- Component çalışmıyor: `EscrowBalanceCard`

**Çözüm:**

```bash
# 1. Backend endpoint implement et
Location: marifetbul-backend/src/main/java/.../WalletController.java
Method: GET /api/v1/wallet/escrow-details
DTO: EscrowDetailsResponse

# 2. Test et
curl -X GET http://localhost:8080/api/v1/wallet/escrow-details \
  -H "Authorization: Bearer {token}"

# 3. Frontend'i doğrula
Component: components/domains/wallet/EscrowBalanceCard.tsx
Hook: hooks/business/wallet/useEscrowDetails.ts
```

**Effort:** 2 SP (~16 saat)  
**Detay:** SPRINT_BACKLOG.md → Story 1.3

---

## 📋 Sprint 1 Özeti (Önerilen)

### Hedef: Code Quality 100%

**Duration:** 1 hafta (5 gün)  
**Velocity:** 5 Story Points  
**Team Capacity:** 40 saat

### Stories

| #   | Story               | SP   | Priority | Duration |
| --- | ------------------- | ---- | -------- | -------- |
| 1.1 | Test Documentation  | 1 SP | P1       | 1 gün    |
| 1.2 | Manual Test Cleanup | 1 SP | P1       | 1 gün    |
| 1.3 | Escrow Details API  | 2 SP | P0       | 2 gün    |
| 1.4 | Data Export Service | 1 SP | P2       | 1 gün    |

### Günlük Plan

```bash
Day 1: Story 1.3 (Escrow API - Part 1)
  ├─ Backend endpoint
  ├─ DTO definitions
  └─ Service layer

Day 2: Story 1.3 (Escrow API - Part 2)
  ├─ Testing
  ├─ Frontend integration
  └─ Deployment

Day 3: Story 1.1 + 1.2
  ├─ Test documentation cleanup
  └─ Manual test page update

Day 4: Story 1.4
  └─ Data export implementation

Day 5: Testing & Review
  ├─ Integration testing
  ├─ Code review
  └─ Sprint retrospective
```

---

## 🛠️ Development Workflow

### Başlangıç

```bash
# 1. Repo clone (if needed)
git clone https://github.com/omerada/marifet.git
cd marifet

# 2. Backend setup
cd marifetbul-backend
./mvnw spring-boot:run

# 3. Frontend setup (yeni terminal)
cd ..
npm install
npm run dev

# 4. Browser
open http://localhost:3000
```

### Story Geliştirme

```bash
# 1. Branch oluştur
git checkout -b feature/story-1-3-escrow-details

# 2. Develop
# ... kod yaz ...

# 3. Test
npm test
cd marifetbul-backend && ./mvnw test

# 4. Commit
git add .
git commit -m "feat(wallet): implement escrow details endpoint"

# 5. Push & PR
git push origin feature/story-1-3-escrow-details
# GitHub'da PR aç
```

### Testing

```bash
# Frontend tests
npm test                    # All tests
npm run test:watch          # Watch mode
npm run test:ci             # Coverage report

# Backend tests
cd marifetbul-backend
./mvnw test                 # All tests
./mvnw test -Dtest=WalletServiceTest  # Specific test
./mvnw test jacoco:report   # Coverage report

# E2E tests
npm run test:e2e            # Playwright tests
```

---

## 📊 Sprint Tracking

### Daily Standup Template

```markdown
**Yesterday:**

- Completed Story 1.3 backend implementation
- Started Story 1.1 test documentation

**Today:**

- Finish Story 1.1
- Start Story 1.2

**Blockers:**

- None
```

### Progress Tracking

```bash
# Story Status
Story 1.1: ⏳ In Progress (60%)
Story 1.2: 📋 To Do
Story 1.3: ✅ Done
Story 1.4: 📋 To Do

# Sprint Progress: 35% (2.5/5 SP)
```

---

## 🎯 Definition of Done

Her story için kontrol listesi:

```markdown
✅ Code Implementation
├─ Feature implemented
├─ Code reviewed (1+ reviewer)
└─ No console errors/warnings

✅ Testing
├─ Unit tests yazıldı
├─ Integration tests geçti
├─ Coverage %80+
└─ Manual test successful

✅ Documentation
├─ Code comments var
├─ API docs updated (Swagger)
├─ README updated (if needed)
└─ CHANGELOG updated

✅ Quality
├─ ESLint passed
├─ TypeScript errors yok
├─ Build successful
└─ No security warnings

✅ Deployment
├─ PR approved
├─ Merged to master
├─ Deployed to staging
└─ Verified on staging
```

---

## 🔍 Troubleshooting

### Backend başlamıyor

```bash
# Check Java version
java -version  # Should be 17+

# Check PostgreSQL
docker ps | grep postgres

# Check Redis
docker ps | grep redis

# Rebuild
./mvnw clean install
```

### Frontend build hatası

```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build

# Check Node version
node -v  # Should be 18.17+
```

### Test başarısız

```bash
# Update snapshots
npm test -- -u

# Clear test cache
npm test -- --clearCache

# Run specific test
npm test -- useEscrowDetails.test.ts
```

---

## 📞 Yardım & Kaynaklar

### Dokümanlar

```bash
README.md                   # Proje overview
PRODUCTION_STATUS.md        # System status
API_QUICK_REFERENCE.md      # API cheat sheet
ANALIZ_RAPORU.md            # Detailed analysis
SPRINT_BACKLOG.md           # Sprint plans
EXECUTIVE_SUMMARY.md        # Summary & recommendations
```

### API Dokümantasyonu

```bash
# Swagger UI
http://localhost:8080/swagger-ui.html

# Health Check
http://localhost:8080/actuator/health

# Metrics
http://localhost:8080/actuator/prometheus
```

### Test Users

```bash
# Freelancer
Email: freelancer@test.com
Password: Test123!

# Employer
Email: employer@test.com
Password: Test123!

# Admin
Email: admin@marifetbul.com
Password: Admin123!
```

---

## ✅ Checklist: İlk Sprint Başlamadan Önce

```markdown
Hazırlık:
├─ ✅ EXECUTIVE_SUMMARY.md okudum
├─ ✅ SPRINT_BACKLOG.md inceledim
├─ ✅ Development environment hazır
├─ ✅ Backend çalışıyor (port 8080)
├─ ✅ Frontend çalışıyor (port 3000)
├─ ✅ Database bağlantısı OK
├─ ✅ Test user ile login oldum
└─ ✅ Sprint goal'ü anladım

Sprint Planning:
├─ ✅ Team capacity belirlendi (40 saat)
├─ ✅ Stories assign edildi
├─ ✅ Daily standup saati ayarlandı
└─ ✅ Definition of Done üzerinde anlaşıldı

Tools:
├─ ✅ Git configured
├─ ✅ IDE hazır (VS Code recommended)
├─ ✅ Postman collection imported
└─ ✅ Database client configured (DBeaver/pgAdmin)
```

---

## 🎉 Başarı Kriterleri

### Sprint 1 Sonunda

```yaml
✅ Tüm stories tamamlandı (5/5 SP)
✅ Code quality 100%
✅ Test coverage 70%+
✅ Zero critical bugs
✅ Documentation updated
✅ Demo ready
```

### 3 Sprint Sonunda

```yaml
✅ All improvements deployed
✅ Advanced features live
✅ User experience enhanced
✅ Tech debt minimal
✅ Team velocity stable
```

---

## 🚀 Hemen Başla!

```bash
# 1. Raporları oku
cat EXECUTIVE_SUMMARY.md
cat SPRINT_BACKLOG.md

# 2. Environment hazırla
./setup-dev.sh  # (if exists) or manual setup

# 3. İlk story'yi al
git checkout -b feature/story-1-3-escrow-details

# 4. Development başla
# Happy coding! 🎉
```

---

**Good Luck! 🍀**

**Questions?**

- Check detailed reports
- Review existing documentation
- Ask team lead

**Remember:**

> The system is solid. Focus on quality improvements and new features!
