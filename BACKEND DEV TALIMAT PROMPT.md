Sen bir üst düzey yazılım mimarı ve Spring Boot uzmanısın.  
Görevin: elimde mevcut olan bir web uygulaması projesine özel, kurumsal düzeyde bir **Spring Boot backend mimarisi tasarımı** yapmak ve geliştirme sürecinin **AI tarafından sorunsuz şekilde yürütülmesini** sağlayacak kadar detaylı bir **teknik roadmap & dokümantasyon** hazırlamaktır.

İstenen çıktılar aşağıdaki başlıklarda detaylı ve eksiksiz olarak verilmelidir:

1. **Proje Analizi:**
   - Web app’in fonksiyonel ve teknik gereksinimlerini analiz et.
   - Frontend tarafıyla etkileşim noktalarını (API, veri formatı, auth mekanizması vs.) açıkla.
   - Kullanıcı tipleri, veri akışı, use case diyagramları öner.
   - Gerekiyorsa varsayımsal proje örneği oluştur (ör: e-ticaret, eğitim platformu, vs.)

2. **Mimari Tasarım:**
   - Spring Boot tabanlı genel mimari yapıyı tanımla (layered architecture, hexagonal, microservice vs.)
   - Her katmanın (Controller, Service, Repository, Domain) görevlerini ayrıntılı açıkla.
   - Kullanılacak modüller: Spring Web, Spring Data JPA, Spring Security, Validation, Lombok, MapStruct, OpenAPI, Actuator vb.
   - Entity–DTO–Mapper yapısını detaylandır.
   - Config, Exception Handling, Logging, Validation, CORS gibi altyapı yapılarını belirt.

3. **Veritabanı Tasarımı:**
   - ORM yapısı ve ilişkisel model (ERD) öner.
   - Migration yönetimi için Flyway veya Liquibase kullanım planı oluştur.
   - Örnek tablo yapıları (User, Role, Product vb.) ile entity örnekleri ver.

4. **API Tasarımı:**
   - RESTful endpoint tasarımı kurallarını belirt (naming convention, status codes).
   - Swagger / OpenAPI dokümantasyonu dahil et.
   - Response standardı (ör: ApiResponse wrapper) oluştur.

5. **Güvenlik Katmanı:**
   - Spring Security yapılandırması (JWT, Role-Based Access Control).
   - Authentication ve Authorization akışını diyagramla açıkla.

6. **Test Stratejisi:**
   - Unit, Integration, ve End-to-End test yapısı planla.
   - JUnit, Mockito, Testcontainers örneklerini dahil et.

7. **DevOps & Deployment Planı:**
   - Docker, Docker Compose yapılandırmasını öner.
   - CI/CD pipeline örneği ver (GitHub Actions, Jenkins, GitLab CI vs.)
   - Environment management (dev/test/prod) stratejisini açıkla.

8. **AI Agent Geliştirme Uyumluluğu:**
   - AI agent’in geliştirme sürecini sorunsuz yürütebilmesi için gerekli veri formatı, dosya hiyerarşisi, otomasyon ve açıklama standartlarını oluştur.
   - Komut açıklamaları, naming convention’lar, açıklamalı kod örnekleri, JSON/XML veri şemaları dahil et.

9. **Roadmap (Zaman Planı):**
   - Sprint bazlı (ör: 2 haftalık) geliştirme planı oluştur.
   - Her sprint için yapılacak işler (analiz, tasarım, kodlama, test, entegrasyon) belirtilsin.

10. **Sonuç:**
    - Tüm mimari kararların kısa bir özetini oluştur.
    - Beklenen çıktıların (dosya yapısı, endpoint listesi, dokümantasyon) net listesini ver.

Çıktı formatı:

- Markdown biçiminde, başlıklar ve alt başlıklarla düzenlenmiş.
- Teknik şemalar (metinsel diyagramlar veya kod blokları içinde) içermeli.
- Gerektiğinde örnek kodlar, JSON response’lar ve dizin yapısı verilmelidir.

Amaç: Bu doküman, AI tabanlı bir yazılım geliştirme ajanının sıfırdan backend geliştirmesini kendi başına yapabileceği kadar **detaylı, sistematik ve açıklayıcı** olmalıdır.

#codebase

Sprint 18 (2 hafta) → Frontend-Backend Integration (CRITICAL)
Sprint 19 (2 hafta) → TODO Cleanup + Domain Completion
Sprint 20 (2 hafta) → Production Preparation
Sprint 21 (1 hafta) → Staging Deployment & Testing
Sprint 22 (1 hafta) → Production Deployment
