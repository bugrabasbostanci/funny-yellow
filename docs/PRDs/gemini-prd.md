### **Ürün Gereksinimleri Dokümanı (PRD): Funny Yellow**

**Sürüm:** 1.1 **Tarih:** 7 Ağustos 2025

#### **1. Giriş ve Problem Tanımı**

Günümüzde WhatsApp, Twitch gibi platformlarda kullanılan sticker'lar, dijital iletişimin vazgeçilmez bir parçasıdır. Ancak kullanıcılar, genellikle düşük çözünürlüklü, arka planı temizlenmemiş veya formatı uygun olmayan görsellerle karşılaşmaktadır. Kaliteli ve kullanıma hazır sticker paketleri bulmak ve bunları kolayca kişisel koleksiyonlarına eklemek zordur.

Bu proje, bu sorunu çözmeyi amaçlamaktadır.

**1.1. Proje Adı ve Vizyonu**

- **Proje Adı:** Funny Yellow
- **Vizyon:** "Funny Yellow", kullanıcılara yüksek kaliteli, özenle seçilmiş ve oluşturulmuş sticker paketleri sunan bir web platformu olarak başlayacaktır. Projenin nihai hedefi, kullanıcıların kendi görsellerini kolayca sticker'a dönüştürebildiği, yapay zeka yardımıyla kalitesini artırabildiği ve hatta özgün karakterler yaratabildiği kapsamlı bir sticker merkezine dönüşmektir. MVP, popüler sarı emojilerin eğlenceli ve düzenlenmiş versiyonlarına odaklanacaktır.

#### **2. Proje Hedefleri ve Başarı Metrikleri**

- **Ana Hedef:** Kullanıcıların yüksek kaliteli "Funny Yellow" temalı sticker'ları kolayca bulup indirebileceği bir web sitesi (MVP) oluşturmak.
- **Kullanıcı Hedefi:** Beğendiği sticker paketlerini kolayca bulma ve bunları kendi cihazlarına indirerek manuel olarak WhatsApp'a ekleme talimatlarına ulaşma.
- **Teknik Hedef:** Gelecekteki fazlara (kullanıcı yüklemesi, AI araçları) kolayca adapte olabilecek ölçeklenebilir bir altyapı kurmak.
- **Başarı Metrikleri (MVP için):**
  - Aylık tekil ziyaretçi sayısı.
  - Sticker paketi indirme sayısı.
  - Sitede geçirilen ortalama süre.

#### **3. Hedef Kitle**

- **Birincil Kitle:** Mesajlaşma uygulamalarını aktif olarak kullanan, iletişimini sticker ve "meme"lerle zenginleştirmeyi seven 16-35 yaş arası kullanıcılar. Özellikle klasik emojilerin yaratıcı ve komik hallerini sevenler.
- **İkincil Kitle:** Twitch yayıncıları, Discord topluluk yöneticileri gibi kendi kitleleri için özel sticker'lara ihtiyaç duyan içerik üreticileri.

#### **4. Marka Kimliği**

- **Tasarım Felsefesi:** Minimalist, modern ve kullanıcı dostu.
- **Ton:** Eğlenceli, samimi ve basit. Site, karmaşadan uzak, sticker'ları ön plana çıkaran temiz bir tasarıma sahip olacaktır.

#### **5. Proje Kapsamı (MVP - Faz 1)**

**Kapsam Dahilindeki Özellikler:**

- **Ana Sayfa:** Popüler ve yeni eklenen "Funny Yellow" sticker paketlerinin sergilendiği bir vitrin.
- **Sticker Paketleri Sayfası:** Tüm sticker paketlerinin listelendiği bir sayfa.
- **Arama Fonksiyonu:** Kullanıcıların etiketlere veya paket isimlerine göre arama yapabilmesi.
- **Sticker Paket Detay Sayfası:** Paketteki tüm sticker'ların önizlemesinin yapıldığı, paketi `.zip` olarak indirme butonu ve manuel yükleme talimatlarının bulunduğu sayfa.
- **Yönetici Paneli (Admin Panel):** Sadece site sahibinin erişebildiği, yeni sticker paketi oluşturma, görselleri yükleme ve yayınlama işlemlerinin yapıldığı basit bir arayüz.

**Kapsam Dışındaki Özellikler (Sonraki Fazlar İçin):**

- Kullanıcı kaydı ve profilleri.
- Kullanıcıların kendi sticker'larını yüklemesi.
- Doğrudan uygulamaya ekleme (Sticker Maker) özelliği.
- Görselden sticker oluşturma aracı.
- Yapay zeka ile kalite artırma özelliği.
- Mobil uygulama.

#### **6. Kullanıcı Hikayeleri ve Özellikler (MVP)**

- **Ziyaretçi Olarak:**
  - Siteye girdiğimde en popüler "Funny Yellow" sticker'larını görmek istiyorum.
  - Aklımdaki bir ifadeyi (örn: "sinsi gülüş") aratarak ilgili sticker'ları bulmak istiyorum.
  - Bir pakete tıkladığımda içindeki tüm sticker'ları net bir şekilde görmek istiyorum.
  - Paketi beğendiğimde, içindeki tüm sticker'ları tek bir `.zip` dosyası olarak bilgisayarıma/telefonuma indirmek istiyorum.
  - İndirdiğim sticker'ları WhatsApp'a nasıl ekleyeceğimi anlatan basit ve resimli talimatları görmek istiyorum.
- **Yönetici Olarak:**
  - Güvenli bir panoya giriş yapmak istiyorum.
  - "Yeni Paket Oluştur" butonu ile yeni bir paket tanımlamak istiyorum (isim, açıklama, etiketler).
  - Oluşturduğum pakete bilgisayarımdan `.webp` formatındaki sticker görsellerini toplu olarak yüklemek istiyorum.
  - Yüklediğim paketi sitede yayınlamak veya yayından kaldırmak istiyorum.

#### **7. Teknik Hususlar (Ön Değerlendirme)**

- **Frontend (Arayüz):** React veya Vue.js. Stil için TailwindCSS.
- **Backend (Sunucu):** Firebase gibi bir BaaS (Backend as a Service) platformu, MVP için hızlı başlangıç ve ölçeklenebilirlik sağlayacaktır.
- **Veritabanı:** Firestore (Firebase'in veritabanı).
- **Depolama (Storage):** Firebase Cloud Storage.

#### **8. Gelecek Fazlar (Yol Haritası)**

- **Faz 2 - Topluluk Katkısı:**
  - Kullanıcıların hesap oluşturup kendi sticker paketlerini yükleyebileceği bir sistem.
  - Yasa dışı/uygunsuz içerikleri engellemek için manuel ve otomatik (AI destekli) içerik denetim mekanizması.
- **Faz 3 - Sticker Stüdyosu:**
  - Kullanıcıların yüklediği JPG/PNG gibi görsellerin arka planını otomatik olarak silen, yeniden boyutlandıran ve doğru formata dönüştüren bir web aracı.
- **Faz 4 - AI Gücü:**
  - Düşük çözünürlüklü görsellerin kalitesini artıran bir yapay zeka modeli entegrasyonu.
  - Kullanıcıların metin tabanlı komutlarla (örn: "göz kırpan astronot kedi") özgün sticker'lar oluşturmasını sağlayan bir AI aracı.
- **Faz 5 - Özgün Marka Karakterleri:**
  - Telif hakkı sorunlarını tamamen ortadan kaldırmak için platforma özel, AI ile üretilebilen veya profesyonel olarak çizilmiş maskotlar ve karakterler oluşturma.

#### **9. Para Kazanma Modeli (Gelecek Fazlar)**

- **MVP (Faz 1):** Tamamen ücretsiz.
- **Freemium Model (Sonraki Fazlar):**
  - **Sticker Stüdyosu:** Temel özellikler ücretsiz, ancak aylık limitin üzerinde kullanım veya yüksek çözünürlüklü indirme gibi premium özellikler ücretli.
  - **AI Araçları:** Sınırlı sayıda ücretsiz deneme hakkı. Daha fazla kullanım için abonelik veya kredi sistemi.
  - **Premium Paketler:** Profesyonel sanatçılar tarafından çizilmiş özel sticker paketlerinin satışı.
