# Product Requirements Document (PRD)

## Funny Yellow - Premium Sticker Platform

### 📋 Özet

**Ürün Adı:** Funny Yellow  
**Vizyon:** Yüksek kaliteli, eğlenceli sticker'ların merkezi platformu olmak  
**Misyon:** Kullanıcılara kaliteli sticker deneyimi sunarak dijital iletişimi zenginleştirmek

---

## 🎯 Proje Hedefleri

### Birincil Hedefler

- Kaliteli sticker içeriği sunmak
- WhatsApp başta olmak üzere popüler platformlara sticker sağlamak
- Düşük kaliteli görselleri sticker formatına optimize etmek
- Kullanıcı dostu ve hızlı bir deneyim sunmak

### İkincil Hedefler

- Topluluk odaklı içerik üretimi
- AI destekli kalite iyileştirme
- Çoklu platform desteği

---

## 👥 Hedef Kitle

### Birincil Segmentler

1. **Casual Kullanıcılar (70%)**

   - 16-35 yaş arası
   - WhatsApp, Instagram, Discord kullanan
   - Eğlenceli içerik arayan
   - Arkadaşlarıyla sticker paylaşan

2. **Content Creator'lar (30%)**

   - Twitch yayıncıları
   - Discord sunucu yöneticileri
   - Sosyal medya influencer'ları

### Kullanıcı Personaları

**Persona 1: Eğlenceli Emre**

- 22 yaşında üniversite öğrencisi
- WhatsApp gruplarında aktif
- Komik içerikleri sever
- Ücretsiz/ucuz çözümler arar

**Persona 2: Creator Ceren**

- 28 yaşında Twitch yayıncısı
- Kendi topluluğu için özel içerik üretir
- Kaliteye önem verir
- Premium özelliklere ödeme yapmaya hazır

---

## 🚀 MVP Özellikleri (Faz 1 - İlk 2 Ay)

### Temel Özellikler

1. **Sticker Galerisi**

   - Admin tarafından yüklenen stickerlar
   - Kategorilere göre filtreleme
   - Arama fonksiyonu
   - Önizleme özelliği

2. **WhatsApp Entegrasyonu**

   - 512x512 WebP formatında export
   - Sticker pack oluşturma (max 30 sticker)
   - WhatsApp'a direkt ekleme linki
   - Mobil uyumlu indirme

3. **Kullanıcı Sistemi**

   - Basit kayıt/giriş (email veya Google)
   - Favori stickerları kaydetme
   - İndirme geçmişi

4. **Temel Kategoriler**

   - Funny Emoji
   - Reactions
   - Memes
   - Expressions
   - Animals

### Teknik Gereksinimler

- Responsive tasarım
- Hızlı yükleme (< 2 saniye)
- SEO optimizasyonu
- Analytics entegrasyonu

---

## 📈 Gelecek Fazlar

### Faz 2 (3-4. Ay)

- **Kullanıcı Yüklemeleri**
  - Moderasyon kuyruğu
  - Otomatik NSFW kontrolü
  - Telif hakkı doğrulama
- **Sticker Maker Tool**
  - Arka plan kaldırma
  - Crop & resize
  - Basit filtreler
  - Format dönüştürme

### Faz 3 (5-6. Ay)

- **AI Özellikleri**
  - Kalite artırma (upscaling)
  - Otomatik arka plan temizleme
  - Stil transferi
- **Monetizasyon**
  - Freemium model aktifleşmesi
  - Pro plan ($4.99/ay)
  - Lifetime plan ($49.99)

### Faz 4 (7+ Ay)

- **Platform Genişlemesi**
  - Telegram desteği
  - Discord entegrasyonu
  - iMessage stickers
- **Sosyal Özellikler**
  - Creator profilleri
  - Beğeni sistemi
  - Özel koleksiyonlar

---

## 💰 İş Modeli

### Freemium Model

**Free Tier**

- Günlük 10 sticker indirme
- Temel kalite (512x512)
- Reklamlar (minimal)
- Watermark'lı maker tool

**Pro Tier ($4.99/ay)**

- Sınırsız indirme
- HD kalite seçeneği
- Reklamsız deneyim
- Öncelikli AI işleme
- Watermark'sız maker tool
- Özel sticker pack'ler

**Lifetime ($49.99)**

- Pro özelliklerin tümü
- Ömür boyu erişim
- Early access yeni özellikler
- Özel badge

---

## 🛠 Teknik Mimari

### Frontend

- **Framework:** Next.js 14
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **UI Components:** Radix UI + Shadcn

### Backend

- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage + CDN
- **Auth:** Supabase Auth

### Altyapı

- **Hosting:** Vercel
- **CDN:** Cloudflare
- **Analytics:** Vercel Analytics + Google Analytics
- **Monitoring:** Sentry

### Veri Modeli

```
Users
- id
- email
- username
- subscription_tier
- created_at

Stickers
- id
- name
- category_id
- file_url
- thumbnail_url
- tags[]
- download_count
- created_by
- status (active/pending/rejected)

Categories
- id
- name
- slug
- icon

Favorites
- user_id
- sticker_id
- created_at

Downloads
- user_id
- sticker_id
- downloaded_at
```

---

## 📊 Başarı Metrikleri

### MVP İçin KPI'lar

- 1000+ kayıtlı kullanıcı (ilk ay)
- 5000+ sticker indirme (ilk ay)
- %20 kullanıcı geri dönüş oranı
- 3+ dakika ortalama oturum süresi

### Uzun Vadeli Hedefler

- 50K+ aktif kullanıcı (6 ay)
- %5 Pro dönüşüm oranı
- 500+ kullanıcı yüklemesi/ay
- 4.5+ App Store puanı

---

## 🚦 Risk ve Önlemler

### Riskler

1. **Telif Hakkı İhlalleri**

   - Önlem: Otomatik görsel tarama, manuel moderasyon

2. **Sunucu Maliyetleri**

   - Önlem: CDN kullanımı, görsel optimizasyonu

3. **Platform Politika Değişiklikleri**

   - Önlem: Çoklu platform desteği

4. **Rekabet**

   - Önlem: Kalite odaklı yaklaşım, hızlı inovasyon

---

## 🎨 Tasarım Prensipleri

### UI/UX Kuralları

- Minimal ve temiz arayüz
- Sarı ana renk teması (#FFC107)
- Büyük önizlemeler
- Tek tıkla indirme
- Mobile-first yaklaşım

### Marka Kimliği

- **Logo:** Gülen sarı emoji varyasyonu
- **Slogan:** "Make Chat Fun Again!"
- **Ton:** Eğlenceli, samimi, genç

---

## 📅 Geliştirme Takvimi

### Sprint 1 (Hafta 1-2)

- [ ] Proje setup (Next.js, Supabase)
- [ ] Veritabanı şeması
- [ ] Auth sistemi
- [ ] Admin panel temeli

### Sprint 2 (Hafta 3-4)

- [ ] Sticker galeri sayfası
- [ ] Kategori ve arama
- [ ] Sticker detay modal
- [ ] İndirme fonksiyonu

### Sprint 3 (Hafta 5-6)

- [ ] WhatsApp pack oluşturucu
- [ ] Kullanıcı profili
- [ ] Favoriler sistemi
- [ ] Mobile optimizasyon

### Sprint 4 (Hafta 7-8)

- [ ] Test ve bug fixing
- [ ] Performance optimizasyonu
- [ ] Analytics entegrasyonu
- [ ] Deployment

---

## 📝 Notlar

### Önemli Kararlar

- MVP'de sadece admin yüklemesi yapılacak
- İlk fazda AI özelliği olmayacak
- WhatsApp'tan başlanacak
- NSFW içerik kesinlikle olmayacak

### Gelecek Fikirler

- Funny Yellow maskot karakteri
- Animasyonlu sticker desteği
- Sticker yarışmaları
- API servisi
- Mobile app

---

## 🔗 Referanslar

### Rakip Analizi

- **GIPHY:** Geniş içerik, zayıf sticker odağı
- **Tenor:** GIF odaklı, sticker eksik
- **StickerMaker:** Basit tool, topluluk yok

### İlham Kaynakları

- Discord Nitro emoji sistemi
- Telegram sticker ekosistemi
- LINE sticker store modeli

---

_Son Güncelleme: MVP v1.0_ _Hazırlayan: Funny Yellow Team_
