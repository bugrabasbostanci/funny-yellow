# Admin Guide - Funny Yellow Sticker Platform (Updated)

## 📋 Güncel Admin Sticker Ekleme Süreci

### 🎯 MVP'de Sticker Ekleme Adımları

#### 1. Sticker'ları Hazırla
- **Background Removal**: [remove.bg](https://www.remove.bg) kullanarak arka planları kaldır
- **Format**: Herhangi bir format (jpg, png, webp) - script dönüştürür
- **Boyut**: Minimum 300x300, script 512x512'ye optimize eder
- **Kalite**: Yüksek çözünürlük tercih et

#### 2. Dosyaları Yerleştir
```bash
# Sticker'ları source klasörüne koy
C:\Users\bb014\Desktop\funny-yellow\public\stickers\source\
```

**Dosya İsimlendirme**:
- Küçük harfler + tire: `happy-emoji-sticker.jpg`
- Açıklayıcı isimler ver
- Boşluk yok, özel karakter yok

#### 3. Script'leri Sırayla Çalıştır

```bash
# 1. Sticker'ları optimize et (WebP 512x512)
npm run optimize-stickers

# 2. Supabase'e yükle (WebP + metadata)
npm run upload-stickers

# 3. PNG versiyonları oluştur (WhatsApp Web için)
npm run convert-webp-to-png
```

#### 4. Metadata Güncelle (Önemli!)

Upload script'indeki metadata section'ını güncelle:

**Dosya**: `scripts/upload-to-supabase-admin.js`

```javascript
const stickerMetadata = {
  'yeni-sticker.webp': { 
    name: 'Yeni Sticker', 
    category: 'reactions', 
    tags: ['yeni', 'cool', 'awesome'] 
  },
  // Diğer stickerlar...
};
```

**Mevcut Kategoriler**:
- `funny-emoji` - Komik emoji'ler
- `reactions` - Tepkiler  
- `expressions` - İfadeler
- `animals` - Hayvanlar
- `memes` - Meme'ler
- `celebration` - Kutlama
- `food` - Yemek
- `nature` - Doğa
- `objects` - Objeler

#### 5. Sonuçları Kontrol Et
- Website'i aç: `npm run dev`
- Yeni sticker'ların göründüğünü kontrol et
- İndirme test et (hem mobil hem desktop)
- PNG versiyonunun oluştuğunu kontrol et

---

## 🔄 Toplu Sticker Ekleme

### 10-20 Sticker Birden Eklemek

```bash
# 1. Tüm dosyaları source/ klasörüne koy
# 2. Metadata'yı güncelle
# 3. Tek seferde çalıştır:
npm run optimize-stickers && npm run upload-stickers && npm run convert-webp-to-png
```

**⚠️ Önemli**: Her yeni sticker için metadata eklemen gerekiyor, yoksa "misc" kategorisine düşer.

---

## 📂 Dosya Yapısı

```
public/stickers/
├── source/          # 🎯 Admin dosyaları buraya
│   ├── happy-emoji.jpg
│   ├── new-sticker.png
│   └── ...
├── webp/           # ⚙️ Script oluşturur
│   ├── happy-emoji.webp
│   └── new-sticker.webp
└── ...
```

**Supabase Storage**:
```
stickers/stickers/
├── happy-emoji.webp    # Mobil indirir
├── happy-emoji.png     # Desktop indirir
└── ...
```

---

## 🔧 Script'lerin Ne Yaptığı

### 1. `npm run optimize-stickers`
- `source/` dosyalarını okur
- 512x512 WebP'ye dönüştürür
- `webp/` klasörüne kaydeder
- Transparency optimize eder

### 2. `npm run upload-stickers`
- `webp/` dosyalarını Supabase'e yükler
- Database'e metadata ekler
- Public URL'ler oluşturur

### 3. `npm run convert-webp-to-png`
- Supabase'deki WebP'leri alır
- PNG'ye dönüştürür
- WhatsApp Web uyumluluğu için

---

## 🚨 Troubleshooting

### Yaygın Sorunlar

**1. Metadata eksik**
```javascript
// scripts/upload-to-supabase-admin.js içinde ekle:
'yeni-dosya.webp': { name: 'İsim', category: 'kategori', tags: ['tag1', 'tag2'] }
```

**2. PNG oluşmuyor**
```bash
# Sharp modülü kontrolü:
npm install sharp
```

**3. Supabase hata**
```bash
# .env.local kontrol et:
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**4. Upload başarısız**
- Service Role Key gerekli (Anon Key değil!)
- Storage bucket permissions kontrol et

---

## ✅ Kalite Kontrol Checklist

### Her Upload Sonrası:
- [ ] Sticker galeride görünüyor
- [ ] Desktop'ta PNG indiriyor
- [ ] Mobile'da WebP indiriyor
- [ ] Transparency doğru çalışıyor
- [ ] Kategori/tags doğru
- [ ] Search'te bulunabiliyor

---

## 📈 İstatistikler

### Current MVP Status:
- **Total Stickers**: Database'den otomatik çekiyor
- **Formats**: WebP (mobil) + PNG (desktop)
- **Categories**: 9 kategori aktif
- **Download tracking**: Çalışıyor

### Admin Dashboard (Future):
- Phase 2: Web interface
- Phase 3: Batch processing UI
- Phase 4: AI background removal

---

## 🎯 Sonraki Adımlar

### Admin için Phase 2:
1. **Web Admin Interface**: `/admin` route
2. **Drag & Drop Upload**: Kolay dosya yükleme  
3. **Preview System**: Upload öncesi önizleme
4. **Category Management**: Yeni kategori ekleme

### Şu Anki Durum:
✅ **MVP Complete**: Manuel process çalışıyor
🔄 **Ready for Scale**: Script'ler production ready
📊 **Analytics Ready**: Download tracking aktif