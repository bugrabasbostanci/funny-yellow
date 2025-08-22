✅ Güncel Sticker Ekleme Süreci (2025)

1. Metadata Oluştur

Az önce oluşturduğumuz sistemle:

# Metadata'yı otomatik oluştur

node scripts/generate-sticker-metadata.js

Bu senin için JSON ve SQL dosyalarını oluşturur.

2. Stickerları Optimize Et

npm run optimize-stickers

3. Database'e Yükle

İki seçenek var:

A) JSON dosyası ile (önerilen):

# scripts/sticker-metadata.json kullanarak

npm run upload-stickers

B) SQL ile direkt:
-- scripts/sticker-inserts.sql içeriğini Supabase'de çalıştır

4. PNG Versiyonları Oluştur

npm run convert-webp-to-png

🔄 Tam Süreç (Tek Komutta):

# 1. Metadata oluştur

node scripts/generate-sticker-metadata.js

# 2. Tümünü çalıştır

npm run optimize-stickers && npm run upload-stickers && npm run convert-webp-to-png

Guide'daki eski metadata sistemi artık geçerli değil - yeni otomatik sistem daha iyi çünkü:

- Dosya isimlerinden otomatik tag üretir
- 77 sticker için manuel metadata yazmana gerek yok
- Tutarlı naming convention kullanır

Şimdi bu yeni süreci test etmek ister misin?
