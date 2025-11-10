# 🛡️ Manuel Ödeme Güvenlik ve Güven Mekanizması

## 🎯 Amaç
Manuel IBAN ödemelerinde hem alıcı hem de satıcıyı koruyacak **karşılıklı onay** ve **itiraz sistemi** oluşturmak.

## 🔐 Güvenlik Katmanları

### 1. **Çift Taraflı Onay Sistemi (Dual Confirmation)**

#### A. Alıcı Tarafı Koruması
```
┌─────────────────────────────────────────────────┐
│  ALICI İÇİN GÜVENLİK MEKANİZMALARI            │
├─────────────────────────────────────────────────┤
│ ✓ Ödeme yapmadan önce iş tanımı onayı          │
│ ✓ Her milestone için ayrı onay süreci          │
│ ✓ İş teslim edilmeden ödeme tamamlanmaz        │
│ ✓ Kalite kontrolü ve revizyon hakkı            │
│ ✓ Anlaşmazlık durumunda itiraz süreci           │
│ ✓ Platform arabuluculuğu garantisi             │
└─────────────────────────────────────────────────┘
```

#### B. Satıcı Tarafı Koruması
```
┌─────────────────────────────────────────────────┐
│  SATICI İÇİN GÜVENLİK MEKANİZMALARI           │
├─────────────────────────────────────────────────┤
│ ✓ Ödeme kanıtı yükleme zorunluluğu             │
│ ✓ Platform tarafından ödeme doğrulama          │
│ ✓ İşe başlamadan önce ödeme onayı              │
│ ✓ Her milestone sonrası kısmi ödeme alma       │
│ ✓ Haksız iptal durumunda itiraz hakkı          │
│ ✓ Yapılan işin kayıt altında olması            │
└─────────────────────────────────────────────────┘
```

### 2. **Manuel Ödeme Doğrulama Süreci**

```
┌──────────────────────────────────────────────────────────┐
│           MANUEL ÖDEME DOĞRULAMA AKIŞI                   │
└──────────────────────────────────────────────────────────┘

1. ÖDEME ÖNCESİ
   ├─ Alıcı: Sipariş detaylarını onaylar
   ├─ Sistem: Satıcı IBAN'ını gösterir
   ├─ Alıcı: Banka dekontunu/screenshot yükler
   └─ Platform: Ödeme tutarını ve alıcı bilgilerini gösterir

2. ÖDEME SONRASI
   ├─ Alıcı: "Ödeme yaptım" işaretler + dekont yükler
   ├─ Sistem: Satıcıya bildirim gönderir
   ├─ Satıcı: Dekont kontrolü yapar
   ├─ Satıcı: Hesabını kontrol eder
   └─ Satıcı: "Ödeme aldım" onayı verir

3. DOĞRULAMA
   ├─ Platform: Her iki tarafın onayını bekler
   ├─ Eşleşme: Tutar, tarih, referans kontrolü
   ├─ Başarılı: Status → PAID, iş başlar
   └─ Sorunlu: İtiraz süreci başlar

4. İŞ SÜRECİ
   ├─ Satıcı: Milestone teslim eder
   ├─ Alıcı: İnceleme yapar (3-7 gün)
   ├─ Onay: Milestone tamamlandı
   └─ Red: Revizyon talebi
```

### 3. **Ödeme Kanıtı Yükleme Sistemi**

```java
/**
 * Manuel ödeme kanıtı entity
 */
@Entity
@Table(name = "manual_payment_proofs")
public class ManualPaymentProof {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    /**
     * İlgili sipariş
     */
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    /**
     * Ödemeyi yapan kullanıcı (buyer)
     */
    @Column(name = "payer_id", nullable = false)
    private UUID payerId;
    
    /**
     * Ödeme dekontu/screenshot URL
     */
    @Column(name = "proof_document_url", nullable = false)
    private String proofDocumentUrl;
    
    /**
     * Ödeme referans numarası
     */
    @Column(name = "payment_reference")
    private String paymentReference;
    
    /**
     * Ödeme tutarı (doğrulama için)
     */
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    /**
     * Ödeme tarihi (kullanıcı beyanı)
     */
    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;
    
    /**
     * Alıcı onayı durumu
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "buyer_confirmation_status")
    private ConfirmationStatus buyerConfirmationStatus;
    
    /**
     * Satıcı onayı durumu
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "seller_confirmation_status")
    private ConfirmationStatus sellerConfirmationStatus;
    
    /**
     * Alıcı onay zamanı
     */
    @Column(name = "buyer_confirmed_at")
    private LocalDateTime buyerConfirmedAt;
    
    /**
     * Satıcı onay zamanı
     */
    @Column(name = "seller_confirmed_at")
    private LocalDateTime sellerConfirmedAt;
    
    /**
     * Satıcı notları
     */
    @Column(name = "seller_notes", columnDefinition = "TEXT")
    private String sellerNotes;
    
    /**
     * Platform doğrulama durumu
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "platform_verification_status")
    private VerificationStatus platformVerificationStatus;
    
    /**
     * Platform moderatör kontrolü
     */
    @Column(name = "verified_by_admin_id")
    private UUID verifiedByAdminId;
    
    /**
     * Doğrulama zamanı
     */
    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

/**
 * Onay durumu enum
 */
public enum ConfirmationStatus {
    PENDING,           // Beklemede
    CONFIRMED,         // Onaylandı
    REJECTED,          // Reddedildi
    DISPUTED           // İtiraz edildi
}

/**
 * Doğrulama durumu enum
 */
public enum VerificationStatus {
    PENDING,           // Platform kontrolü bekleniyor
    AUTO_VERIFIED,     // Her iki taraf onayladı (otomatik)
    MANUALLY_VERIFIED, // Admin manuel doğruladı
    REJECTED,          // Platform reddetti
    UNDER_REVIEW       // İnceleme altında
}
```

### 4. **Otomatik Güvenlik Kontrolleri**

```java
/**
 * Manuel ödeme güvenlik servisi
 */
@Service
public class ManualPaymentSecurityService {
    
    /**
     * Ödeme kanıtı doğrulama
     */
    public ValidationResult validatePaymentProof(ManualPaymentProof proof, Order order) {
        List<String> errors = new ArrayList<>();
        
        // 1. Tutar kontrolü
        if (!proof.getAmount().equals(order.getTotalAmount())) {
            errors.add("Ödeme tutarı sipariş tutarı ile eşleşmiyor");
        }
        
        // 2. Tarih kontrolü (sipariş oluşturma tarihinden önce olamaz)
        if (proof.getPaymentDate().isBefore(order.getCreatedAt())) {
            errors.add("Ödeme tarihi sipariş tarihinden önce olamaz");
        }
        
        // 3. Belge kontrolü
        if (proof.getProofDocumentUrl() == null || proof.getProofDocumentUrl().isEmpty()) {
            errors.add("Ödeme kanıtı belgesi yüklenmedi");
        }
        
        // 4. Zaman aşımı kontrolü (örn: 7 gün içinde onaylanmalı)
        if (proof.getCreatedAt().plusDays(7).isBefore(LocalDateTime.now())) {
            errors.add("Ödeme onayı zaman aşımına uğradı");
        }
        
        return new ValidationResult(errors.isEmpty(), errors);
    }
    
    /**
     * Her iki taraf onayladı mı kontrol
     */
    public boolean isMutuallyConfirmed(ManualPaymentProof proof) {
        return proof.getBuyerConfirmationStatus() == ConfirmationStatus.CONFIRMED
            && proof.getSellerConfirmationStatus() == ConfirmationStatus.CONFIRMED;
    }
    
    /**
     * Otomatik ödeme onayı (her iki taraf onaylarsa)
     */
    public void autoConfirmIfMutuallyApproved(ManualPaymentProof proof, Order order) {
        if (isMutuallyConfirmed(proof)) {
            proof.setPlatformVerificationStatus(VerificationStatus.AUTO_VERIFIED);
            proof.setVerifiedAt(LocalDateTime.now());
            
            // Siparişi PAID durumuna geçir
            order.setStatus(OrderStatus.PAID);
            
            log.info("Payment auto-verified for order: {}", order.getOrderNumber());
            
            // Bildirimleri gönder
            sendPaymentConfirmedNotifications(order);
        }
    }
}
```

### 5. **Zaman Aşımı ve Otomatik Eylemler**

```java
/**
 * Zamanlanmış görevler - Ödeme güvenliği
 */
@Service
public class ManualPaymentSchedulerService {
    
    /**
     * Her gün çalışır - Bekleyen ödemeleri kontrol eder
     */
    @Scheduled(cron = "0 0 9 * * *") // Her gün saat 09:00
    public void checkPendingPayments() {
        
        // 1. 24 saat içinde satıcı onayı gelmeyenler
        List<ManualPaymentProof> pendingSellerConfirmations = 
            paymentProofRepository.findPendingSellerConfirmations(
                LocalDateTime.now().minusHours(24)
            );
        
        for (ManualPaymentProof proof : pendingSellerConfirmations) {
            // Hatırlatma bildirimi gönder
            notificationService.sendPaymentConfirmationReminder(
                proof.getOrder().getSeller(),
                proof.getOrder()
            );
        }
        
        // 2. 48 saat içinde alıcı dekontu yüklemeyenler
        List<Order> ordersWithoutProof = 
            orderRepository.findPendingPaymentWithoutProof(
                LocalDateTime.now().minusHours(48)
            );
        
        for (Order order : ordersWithoutProof) {
            // Alıcıya hatırlatma
            notificationService.sendPaymentProofUploadReminder(
                order.getBuyer(),
                order
            );
        }
        
        // 3. 7 gün içinde onaylanmayan siparişler
        List<ManualPaymentProof> expiredProofs = 
            paymentProofRepository.findUnconfirmedAfterDays(7);
        
        for (ManualPaymentProof proof : expiredProofs) {
            // İtiraz sürecini başlat
            disputeService.createAutoDispute(
                proof.getOrder(),
                DisputeReason.PAYMENT_NOT_CONFIRMED,
                "Ödeme 7 gün içinde karşılıklı onaylanmadı"
            );
        }
    }
    
    /**
     * Milestone teslim onayı için zaman aşımı
     */
    @Scheduled(cron = "0 0 10 * * *") // Her gün saat 10:00
    public void checkMilestoneApprovals() {
        
        // 5 gün içinde alıcı onayı gelmemiş milestone'lar
        List<OrderMilestone> pendingApprovals = 
            milestoneRepository.findDeliveredButNotApproved(
                LocalDateTime.now().minusDays(5)
            );
        
        for (OrderMilestone milestone : pendingApprovals) {
            // Hatırlatma gönder
            notificationService.sendMilestoneApprovalReminder(
                milestone.getOrder().getBuyer(),
                milestone
            );
        }
        
        // 7 gün içinde onaylanmazsa otomatik onayla
        List<OrderMilestone> autoApprovalCandidates = 
            milestoneRepository.findDeliveredButNotApproved(
                LocalDateTime.now().minusDays(7)
            );
        
        for (OrderMilestone milestone : autoApprovalCandidates) {
            // Otomatik onay
            milestone.setStatus(MilestoneStatus.ACCEPTED);
            milestone.setAcceptedAt(LocalDateTime.now());
            milestone.setAutoApproved(true);
            milestoneRepository.save(milestone);
            
            log.info("Milestone auto-approved after 7 days: {}", milestone.getId());
            
            // Bildirimleri gönder
            notificationService.sendMilestoneAutoApprovedNotification(milestone);
        }
    }
}
```

### 6. **İtiraz ve Arabuluculuk Sistemi**

```java
/**
 * Manuel ödeme itiraz süreci
 */
@Service
public class ManualPaymentDisputeService {
    
    /**
     * İtiraz oluştur
     */
    public Dispute createPaymentDispute(
        UUID orderId,
        UUID initiatorId,
        PaymentDisputeReason reason,
        String description,
        List<String> evidenceUrls
    ) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        Dispute dispute = Dispute.builder()
            .orderId(orderId)
            .initiatorId(initiatorId)
            .reason(reason.name())
            .description(description)
            .status(DisputeStatus.OPEN)
            .evidenceDocuments(String.join(",", evidenceUrls))
            .build();
        
        dispute = disputeRepository.save(dispute);
        
        // Siparişi DISPUTED durumuna al
        order.setStatus(OrderStatus.DISPUTED);
        orderRepository.save(order);
        
        // Platform yöneticilerine bildirim
        notificationService.notifyAdminsOfNewDispute(dispute);
        
        // Karşı tarafa bildirim
        UUID respondentId = initiatorId.equals(order.getBuyer().getId()) 
            ? order.getSeller().getId() 
            : order.getBuyer().getId();
        notificationService.sendDisputeNotification(respondentId, dispute);
        
        return dispute;
    }
    
    /**
     * Platform arabuluculuğu
     */
    public void resolveDispute(
        UUID disputeId,
        UUID adminId,
        DisputeResolution resolution,
        String adminNotes
    ) {
        Dispute dispute = disputeRepository.findById(disputeId)
            .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
        
        Order order = orderRepository.findById(dispute.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        
        dispute.setStatus(DisputeStatus.RESOLVED);
        dispute.setResolvedBy(adminId);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setResolution(resolution.name());
        dispute.setAdminNotes(adminNotes);
        
        // Çözüme göre eylem al
        switch (resolution) {
            case REFUND_TO_BUYER:
                // Alıcıya iade bildirimi
                order.setStatus(OrderStatus.CANCELED);
                notificationService.sendRefundNotification(order.getBuyer(), order);
                break;
                
            case PAYMENT_TO_SELLER:
                // Satıcıya ödeme onayı
                order.setStatus(OrderStatus.PAID);
                notificationService.sendPaymentApprovedNotification(order.getSeller(), order);
                break;
                
            case PARTIAL_REFUND:
                // Kısmi iade işlemi
                // Milestone bazlı hesaplama yapılabilir
                break;
                
            case ORDER_CANCEL_NO_REFUND:
                order.setStatus(OrderStatus.CANCELED);
                break;
        }
        
        disputeRepository.save(dispute);
        orderRepository.save(order);
        
        // Her iki tarafa sonuç bildirimi
        notificationService.sendDisputeResolutionNotification(dispute, order);
    }
}

/**
 * İtiraz nedenleri
 */
public enum PaymentDisputeReason {
    PAYMENT_NOT_RECEIVED,        // Satıcı: Ödeme almadım
    PAYMENT_AMOUNT_INCORRECT,    // Satıcı: Tutar yanlış
    WORK_NOT_DELIVERED,          // Alıcı: İş teslim edilmedi
    WORK_QUALITY_POOR,           // Alıcı: İş kalitesiz
    FAKE_PAYMENT_PROOF,          // Satıcı: Sahte dekont
    SELLER_UNRESPONSIVE,         // Alıcı: Satıcı yanıt vermiyor
    BUYER_UNREASONABLE_DEMANDS,  // Satıcı: Mantıksız talepler
    SCOPE_CHANGED_WITHOUT_CONSENT // Her iki taraf
}

/**
 * İtiraz çözüm kararları
 */
public enum DisputeResolution {
    REFUND_TO_BUYER,            // Tam iade
    PAYMENT_TO_SELLER,          // Ödeme satıcıya
    PARTIAL_REFUND,             // Kısmi iade
    ORDER_CANCEL_NO_REFUND,     // İptal (iade yok)
    CONTINUE_WITH_REVISION      // Revizyon ile devam
}
```

### 7. **Kullanıcı Güvenilirlik Skorları**

```java
/**
 * Kullanıcı güvenilirlik sistemi
 */
@Entity
@Table(name = "user_trust_scores")
public class UserTrustScore {
    
    @Id
    private UUID userId;
    
    /**
     * Genel güvenilirlik skoru (0-100)
     */
    @Column(name = "trust_score")
    private Integer trustScore;
    
    /**
     * Tamamlanan işler
     */
    @Column(name = "completed_orders")
    private Integer completedOrders;
    
    /**
     * İptal edilen işler
     */
    @Column(name = "cancelled_orders")
    private Integer cancelledOrders;
    
    /**
     * İtiraz sayısı
     */
    @Column(name = "dispute_count")
    private Integer disputeCount;
    
    /**
     * Lehine sonuçlanan itirazlar
     */
    @Column(name = "disputes_won")
    private Integer disputesWon;
    
    /**
     * Aleyhine sonuçlanan itirazlar
     */
    @Column(name = "disputes_lost")
    private Integer disputesLost;
    
    /**
     * Zamanında teslim oranı (%)
     */
    @Column(name = "on_time_delivery_rate")
    private BigDecimal onTimeDeliveryRate;
    
    /**
     * Hızlı yanıt oranı (%)
     */
    @Column(name = "response_rate")
    private BigDecimal responseRate;
    
    /**
     * Ortalama değerlendirme puanı
     */
    @Column(name = "average_rating")
    private BigDecimal averageRating;
    
    /**
     * Kimlik doğrulama durumu
     */
    @Column(name = "identity_verified")
    private Boolean identityVerified;
    
    /**
     * Platform üyelik süresi (gün)
     */
    @Column(name = "membership_days")
    private Integer membershipDays;
    
    /**
     * Risk seviyesi
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "risk_level")
    private RiskLevel riskLevel;
    
    /**
     * Güvenilir kullanıcı rozeti
     */
    @Column(name = "trusted_badge")
    private Boolean trustedBadge;
}

/**
 * Risk seviyeleri
 */
public enum RiskLevel {
    LOW,        // Düşük risk (skor 80-100)
    MEDIUM,     // Orta risk (skor 50-79)
    HIGH,       // Yüksek risk (skor 0-49)
    FLAGGED     // İşaretlenmiş (manuel inceleme)
}
```

### 8. **Platform Garantileri**

```markdown
┌────────────────────────────────────────────────────────┐
│          MARİFETBUL PLATFORM GARANTİLERİ              │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🛡️ ALICI GÜVENCESİ                                   │
│  ├─ İş teslim edilmezse %100 iade garantisi          │
│  ├─ Kalite standartlarını karşılamazsa revizyon hakkı│
│  ├─ 7 gün içinde çözülmeyen sorunlar için arabulucu  │
│  └─ Platform sigorta fonu desteği                     │
│                                                        │
│  💼 SATICI GÜVENCESİ                                  │
│  ├─ Teslim edilen iş onaylanmazsa otomatik kabul     │
│  ├─ Haksız iptal durumunda itiraz hakkı              │
│  ├─ Platform arabuluculuk desteği                     │
│  └─ Yapılan işin belgelenmesi ve saklanması          │
│                                                        │
│  ⚖️ PLATFORM SORUMLULUGU                              │
│  ├─ 24/7 destek hattı                                 │
│  ├─ Maksimum 72 saat içinde itiraz yanıtı            │
│  ├─ Tarafsız hakem değerlendirmesi                    │
│  └─ Güvenilirlik skor sistemi                         │
│                                                        │
└────────────────────────────────────────────────────────┘
```

## 📱 Frontend Kullanıcı Arayüzü Akışı

### Alıcı Perspektifi
```
1. Sipariş Oluşturma
   ├─ İş detaylarını gir
   ├─ Milestone'ları belirle
   ├─ Satıcıyı seç
   └─ ⚠️ "Ödeme Taahhüdü" onay kutusu

2. Ödeme Süreci
   ├─ Satıcı IBAN'ını gör
   ├─ Banka transferi yap
   ├─ Dekont/Screenshot yükle
   ├─ Tutar ve tarihi onayla
   └─ ✅ "Ödeme yaptım" butonuna tıkla

3. Bekleme Süreci
   ├─ Satıcı onayı bekleniyor...
   ├─ Bildirim: "Satıcı ödemeyi onayladı"
   └─ Durum: PAID

4. Milestone Takibi
   ├─ Satıcı milestone teslim etti
   ├─ Dosyaları inceleme (3-7 gün)
   ├─ Onayla / Revizyon iste
   └─ Her onayda ilerleme

5. Proje Tamamlama
   ├─ Son milestone onayı
   ├─ Değerlendirme yap
   └─ ✅ Tamamlandı
```

### Satıcı Perspektifi
```
1. Teklif ve Seçilme
   ├─ İş detaylarını gör
   ├─ Teklif ver
   └─ Seçilme bildirimi

2. Ödeme Bekleme
   ├─ IBAN bilgisi paylaşıldı
   ├─ Alıcı dekontu yükledi
   ├─ Hesap kontrolü yap
   ├─ Dekont detaylarını gör
   └─ ✅ "Ödeme aldım" onayla

3. İş Süreci
   ├─ Milestone üzerinde çalış
   ├─ Teslim et (dosya + açıklama)
   ├─ Alıcı onayını bekle
   └─ Gerekirse revizyon yap

4. Ödeme Garantisi
   ├─ 7 gün içinde onaylanmazsa otomatik kabul
   ├─ Her milestone ayrı onaylı
   └─ Sorun olursa itiraz et
```

## 🔔 Bildirim Sistemi

```java
/**
 * Manuel ödeme bildirimleri
 */
public class ManualPaymentNotifications {
    
    // Alıcıya bildirimler
    - "Lütfen ödeme dekontu yükleyin (48 saat)"
    - "Satıcı ödemenizi onayladı - İş başladı"
    - "Milestone teslim edildi - İncelemeniz bekleniyor"
    - "5 gün içinde onaylamazsanız otomatik onaylanacak"
    
    // Satıcıya bildirimler
    - "Alıcı ödeme yaptığını bildirdi - Lütfen kontrol edin"
    - "Ödemenizi onaylamadınız - 24 saat hatırlatma"
    - "Milestone onaylandı - Sonraki aşamaya geçebilirsiniz"
    - "Alıcı revizyon talep etti"
    
    // Platform bildirimleri
    - "Yeni itiraz oluşturuldu - İnceleme gerekiyor"
    - "Ödeme 7 güne uzadı - Arabuluculuk gerekebilir"
    - "Kullanıcı güvenilirlik skoru düştü"
}
```

## 🎯 Uygulama Adımları

### Faz 1: Entity ve DTO'lar (Öncelik: Yüksek)
- [ ] ManualPaymentProof entity
- [ ] UserTrustScore entity  
- [ ] PaymentDisputeReason enum
- [ ] İlgili DTO'lar

### Faz 2: Servis Katmanı (Öncelik: Yüksek)
- [ ] ManualPaymentSecurityService
- [ ] ManualPaymentDisputeService
- [ ] ManualPaymentSchedulerService
- [ ] UserTrustScoreService

### Faz 3: Controller ve API (Öncelik: Orta)
- [ ] Payment proof upload endpoint
- [ ] Buyer/Seller confirmation endpoints
- [ ] Dispute creation/resolution endpoints
- [ ] Trust score endpoints

### Faz 4: Frontend UI (Öncelik: Yüksek)
- [ ] Payment proof upload component
- [ ] Dual confirmation interface
- [ ] Dispute filing form
- [ ] Trust score display badge

### Faz 5: Bildirim Entegrasyonu (Öncelik: Orta)
- [ ] Payment reminder emails
- [ ] Milestone approval reminders
- [ ] Dispute notifications
- [ ] Auto-approval warnings

### Faz 6: Admin Panel (Öncelik: Orta)
- [ ] Dispute resolution dashboard
- [ ] Payment verification tools
- [ ] User trust score management
- [ ] Manual verification interface

## 📊 Metrikler ve İzleme

```sql
-- Güvenlik metrikleri
- Ortalama ödeme onay süresi
- İtiraz oranı (%)
- Otomatik onay oranı (%)
- Platform müdahale oranı (%)
- Kullanıcı memnuniyet skoru

-- Risk metrikleri
- Sahte dekont girişimleri
- Zaman aşımı olan ödemeler
- Çözülemeyen itirazlar
- Düşük güvenilirlik skorlu işlemler
```

---

**Özet**: Bu sistem hem alıcıyı hem satıcıyı korurken, **karşılıklı güven** ve **platform arabuluculuğu** ile manuel ödeme sürecini güvenli hale getirir. Escrow altyapısı korunur, gelecekte entegre ödeme sistemine geçiş kolay olur.
