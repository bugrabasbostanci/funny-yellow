# Microsoft Clarity Setup Guide

Microsoft Clarity kullanıcı davranışlarını anlamak için ücretsiz bir analytics tool'dur.

## 🎯 Ne Sağlar?

- **Heatmaps**: Kullanıcılar nereye tıklıyor
- **Session Recordings**: Kullanıcı davranışlarını video olarak görme  
- **User Insights**: Hangi sticker'lar popüler, hangi sayfalar problematik
- **Performance Metrics**: Sayfa yükleme süreleri, hata takibi

## 🚀 Setup Adımları

### 1. Microsoft Clarity Hesabı Aç

1. [clarity.microsoft.com](https://clarity.microsoft.com) adresine git
2. Microsoft hesabınla giriş yap (ücretsiz)
3. "Add new project" butonuna tıkla
4. Website URL: `https://funnyyellow.com` (veya domain'in)

### 2. Project ID'yi Al

Clarity dashboard'da project oluşturduktan sonra:
- Project ID'yi kopyala (örnek: `k1x2y3z4a5`)

### 3. Environment Variable Ekle

`.env.local` dosyası oluştur (eğer yoksa):

```bash
# .env.local dosyasına ekle:
NEXT_PUBLIC_CLARITY_PROJECT_ID=k1x2y3z4a5  # Kendi project ID'n
```

### 4. Test Et

```bash
# Development server'ı başlat
npm run dev

# Browser'da http://localhost:3000 aç
# Developer tools > Console'da "clarity" yaz
# Eğer clarity objesi döndürürse kurulum başarılı
```

## 🔍 Clarity'de Neler Görebilirsin?

### Sticker Analytics
- Hangi sticker'lara daha çok tıklanıyor
- Search'te hangi kelimeler aranıyor  
- Kullanıcılar hangi tag'leri seçiyor

### Performance Issues
- Sayfa yükleme sorunları
- Mobile vs desktop kullanım farkları
- Error'lar ve broken interactions

### User Journey
- Kullanıcılar siteye nasıl geliyor
- Kaç dakika kalıyorlar
- Nereden çıkıyorlar

## 📊 Production'da Aktivasyon

Bu integration production'da otomatik olarak çalışacak:

```bash
# Production build'inde environment variable'lar dahil
npm run build
npm start

# Vercel/Netlify deploy'da da environment variables'ları eklemen gerek
```

## 🎯 Faydalı Metrics

### İlk Ay Takip Edilecekler:
- **Session Duration**: Ortalama kaç dakika
- **Bounce Rate**: Tek sayfa görüp çıkanlar  
- **Popular Stickers**: En çok download edilenler
- **Search Terms**: Kullanıcılar ne arıyor
- **Mobile vs Desktop**: Platform kullanım oranları

### UX Optimizasyonu İçin:
- Sticker grid'de scroll behavior
- Search functionality kullanımı
- Download button'larına tıklama oranları
- Filter usage patterns

---

**Not**: Clarity data'sı 24-48 saat içinde görünmeye başlar. İlk kurulumdan sonra biraz beklemen normal.