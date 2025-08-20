# Admin Guide - Funny Yellow Sticker Platform

## Sticker Ekleme Süreci (MVP)

### Yeni Sticker'lar Ekleme

#### 1. Sticker'ları Hazırla
- **Background Removal**: [remove.bg](https://www.remove.bg) veya [photopea.com](https://www.photopea.com) kullanarak arka planları kaldır
- **Format**: Herhangi bir format olabilir (jpg, png, webp)
- **Boyut**: Minimum 300x300, maksimum sınır yok (script otomatik optimize eder)
- **Kalite**: Yüksek çözünürlük tercih et (script küçültecek)

#### 2. Dosyaları Yerleştir
```bash
# Sticker'ları source klasörüne koy
C:\Users\bb014\Desktop\funny-yellow\public\stickers\source\
```

**Dosya İsimlendirme**:
- Küçük harfler kullan
- Boşluk yerine `-` kullan
- Açıklayıcı isimler ver
- Örnek: `happy-emoji-sticker.jpg`

#### 3. Script'leri Çalıştır
```bash
# 1. Sticker'ları optimize et (512x512 WebP)
npm run optimize-stickers

# 2. Supabase'e yükle
npm run upload-stickers
```

#### 4. Sonuçları Kontrol Et
- Website'i aç ve yeni sticker'ların göründüğünü kontrol et
- WhatsApp export'u test et

### Mevcut Sticker'lara Ekleme Yapmak

Eğer sistemde zaten sticker'lar varsa ve 5 tane daha eklemek istiyorsan:

1. **Yeni sticker'ları source klasörüne ekle** (eski olanları silme)
2. **Script'ler sadece yeni dosyaları işleyecek** (existing check var)
3. **Normal süreci takip et**

### Batch İşlemler

#### Çoklu Sticker Yükleme
```bash
# Örnek: 50 sticker birden
# 1. Tüm dosyaları source/ klasörüne koy
# 2. Tek komutla işle
npm run optimize-stickers && npm run upload-stickers
```

#### Sticker Güncelleme
```bash
# Mevcut sticker'ı güncellemek için:
# 1. Aynı isimle source/ klasörüne koy
# 2. Script'i çalıştır (overwrite eder)
npm run optimize-stickers
npm run upload-stickers
```

### Troubleshooting

#### Yaygın Sorunlar

**1. Script çalışmıyor**
```bash
# Node modüllerini yenile
npm install
```

**2. Upload başarısız**
- `.env.local` dosyasında Supabase keys'lerini kontrol et
- İnternet bağlantısını kontrol et

**3. Sticker gözükmüyor**
- Browser cache'i temizle (Ctrl+F5)
- Database connection'ı kontrol et

**4. Dosya boyutu fazla**
- Script otomatik optimize eder ama çok büyükse manuel küçült
- Hedef: 100KB altı, 512x512 WebP

### Kalite Kontrol

#### Her Upload Sonrası Kontrol Et:
- [ ] Sticker'lar galeride görünüyor
- [ ] Transparancy doğru çalışıyor  
- [ ] Download çalışıyor
- [ ] WhatsApp export çalışıyor
- [ ] Search/filter çalışıyor

### Dosya Organizasyonu

```
public/stickers/
├── source/          # Ham dosyalar (background removed)
├── webp/           # İşlenmiş 512x512 WebP dosyalar
└── mvp stickers/   # Eski organizasyon (silinebilir)
```

**Not**: Sadece `source/` klasörüne dosya ekle. `webp/` klasörü script tarafından otomatik oluşturulur.