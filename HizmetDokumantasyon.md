📘 MARİFET BUL — GÜNCELLENMİŞ GÜVENLİ HİZMET AKIŞI & GEREKSİNİM DOKÜMANI

🔹 Amaç

Hizmet veren ve hizmet alan kullanıcılar arasında güvenli, çok aşamalı bir iş süreci oluşturmak; ödemelerin sistem dışında (şimdilik IBAN üzerinden) yapılacak şekilde geliştirme, sistem mimarisinde mevcut olan ödeme sistemi yapısı, entegre bir güvenli ödeme altyapısına  (ör. iyzico, PayTR) dokunulmayacak şuanlık beklemede kalacak. Frontend kısmında yeni yapıya geçilecek.

🔹 1. İş Akışı (Workflow)
A. Hizmet Talebi ve Aşama Belirleme
Hizmet Alan Kullanıcı (HA) yeni bir hizmet talebi oluşturur.
Hizmet kategorisi seçer.
Açıklama, teslim tarihi, bütçe, konum (varsa) girer.
“İş Aşamaları” (milestone) belirler:
Örn. “Tasarım → Onay → Teslim → Değerlendirme”
Her aşamaya süre, açıklama ve ücret oranı atanabilir.
Talep yayına alınır.

B. Hizmet Veren (HV) Başvurusu ve Seçim
Hizmet verenler ilana başvurur.
Teklif fiyatı ve tahmini teslim süresi sunar.
HA bir hizmet vereni seçer ve proje başlatılır.
Sistem “Proje Başlatıldı” durumuna geçer.
Taraflar özel mesajlaşma alanında iletişim kurabilir.

C. Ödeme (IBAN Bazlı – Manuel)
Sistem, seçilen hizmet verenin IBAN bilgisini görüntüler.
HA ödemeyi manuel olarak IBAN’a gönderir.
Sistem bu işlemi “Bekleyen Ödeme” durumunda gösterir.
HV, ödemeyi aldığını sistemde “Onayla” butonuyla bildirir.
Sistem durumu “Ödeme Alındı – Hizmete Başlandı” olarak günceller.

⚠️ Not: Şimdilik ödeme sistem dışında hizmet veren ve alan arasında yapılır; daha önce geliştirilen mevcut yapı arkaplanda kalabilir.

D. Hizmet Süreci ve Aşamalar
HV her aşamayı tamamladıkça sistem üzerinden “Aşama Tamamlandı” bildirimi gönderir.
HA, yapılan işi inceleyip “Onayla” veya “Revizyon İste” seçeneği sunar.
Revizyonlar sistem içi mesajlaşma üzerinden yönetilir.
Onaylanan aşama “Tamamlandı” statüsüne geçer.

E. Hizmet Teslimi ve Onay
Son aşama tamamlandığında:
HV “Hizmet Teslim Edildi” butonuna basar.
HA inceleme yapar ve “Teslimi Onayla” seçeneğiyle hizmeti tamamlar.
Sistem projenin durumunu “Tamamlandı” olarak işaretler.

F. Değerlendirme Aşaması
Her iki taraf da proje tamamlandıktan sonra:
1–5 yıldız arası puan ve yorum bırakabilir.
Bu değerlendirmeler profil puanını etkiler.

🔹 2. İş Akışı Durum Diyagramı (Özet)
Oluşturuldu → Başvuru Alınıyor → Hizmet Veren Seçildi
→ Ödeme Bekleniyor → Ödeme Alındı
→ Aşama 1 Devam → Aşama 1 Tamamlandı → ...
→ Hizmet Teslim Edildi → Onay Bekleniyor
→ Tamamlandı → Değerlendirildi

🔹 3. Gereksinim Analizi
✅ Fonksiyonel Gereksinimler
Kategori	Gereksinim	Açıklama
Kullanıcı Yönetimi	Kullanıcı kayıt, giriş, profil düzenleme	E-posta, telefon, doğrulama
Hizmet Talebi	Talep oluşturma, kategori seçimi, açıklama, teslim tarihi	Çok aşamalı iş tanımı desteği
Aşama Yönetimi	İş aşamalarını oluşturma, düzenleme, ilerleme takibi	Her aşama için durum güncelleme
Teklif Sistemi	Hizmet verenlerin ilana teklif sunması	Fiyat ve süre teklifleri
IBAN Yönetimi	Hizmet veren IBAN bilgisi ekleme ve doğrulama	Şimdilik manuel işlem
Ödeme Akışı (dummy)	Ödeme yapıldı / alındı durumları	API entegrasyonuna uygun modüler yapı
Mesajlaşma	Hizmet alan ve veren arasında iletişim	Revizyon süreci yönetimi dahil
Bildirimler	Sistem içi bildirim, e-posta bildirimi	Aşama geçişlerinde
Değerlendirme	Hizmet sonrası puanlama ve yorum	Profil puanına etki eder

Amaç:
Mevcut sistemde ödeme altyapısı aktif edilmeden, ancak gelecekte güvenli ödeme entegrasyonuna (iyzico/PayTR) hazır olacak şekilde IBAN bazlı manuel ödeme sürecini mevcut yapıyı backendde koruyarak silmeden, frontendde yeni yapıyı kullanacak şekilde aşamalı proje işleyişini ve teslim/inceleme/değerlendirme aşamalarını ekle.

Görevler:

Kullanıcılar arası proje sürecini yukarıdaki iş akışına göre düzenle.
Her proje için birden fazla “iş aşaması (milestone)” tanımlanabilir olsun.
Her aşamada durum: “Başlamadı / Devam Ediyor / Tamamlandı / Revizyon Bekliyor / Onaylandı”.
Hizmet veren IBAN bilgisini profil sayfasında sakla ve proje başlatıldığında hizmet alan tarafından görüntülenebilir hale getir.
Ödeme süreci şimdilik manuel (kullanıcı IBAN’a gönderim yapıyor)
Hizmet tamamlandığında sistem otomatik olarak değerlendirme çağrısı (rating modal) açsın.
Tüm durum değişikliklerinde sistem içi ve e-posta bildirimi gönder.
İş akışı tablosu ve durum logları yönetici panelinde izlenebilir olsun.

Test Senaryoları:
 Kullanıcı iş talebi oluşturabilir
 Hizmet veren teklif verebilir
 Hizmet alan seçip proje başlatabilir
 IBAN görüntülenip manuel ödeme onaylanabilir
 Aşamalar ilerleyip onaylanabilir
 Proje tamamlandığında değerlendirme yapılabilir