Tag Generator Nasıl Çalışacak?

1. Çalışma Yöntemi

- Title-based pattern matching: Sticker'ın name field'ından tag üretir
- Pattern kategorileri: Emotion, character, object, color patterns
- Scoring sistemi: Tag'lerin relevance'ına göre sıralama
- Synonym expansion: İlgili eş anlamlıları da ekler

2. Ne Zaman Çalışır?

A) Yeni sticker upload'ında:

- Admin upload formunda title girildiğinde real-time çalışır
- Suggested tag'ler gösterir, admin onaylayabilir/düzenleyebilir
- Final tag'ler database'e kaydedilir

B) Mevcut sticker'lar için:

- Bulk tag generation tool oluşturacağız
- Admin panelde "Generate Tags for All" butonu
- Mevcut sticker'ların name field'ından tag üretir
- Existing tag'leri korur, yeni tag'leri ekler

3. Örnek Çalışma

Sticker name: "Smiling Cowboy"
→ Generated tags: ["cowboy", "happy", "smile", "western", "sheriff",
"cheerful", "emoji"]

Mevcut sticker name: "angry-red-face-emoji"
→ Generated tags: ["angry", "red", "face", "emoji", "mad", "furious",
"passion"]

4. Database Impact

- Mevcut tags field'ı (string[]) kullanır
- Existing tag'leri silmez, yeni tag'leri ekler
- Admin manuel olarak da tag ekleyebilir/silebilir
