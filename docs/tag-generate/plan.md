```
Here is Claude's plan:                                                         │
│ ╭────────────────────────────────────────────────────────────────────────────╮ │
│ │ Tag Generate Özelliği Implementation Planı                                 │ │
│ │                                                                            │ │
│ │ 1. Core Tag Generator Service                                              │ │
│ │                                                                            │ │
│ │ - lib/tag-generator.ts - Title-based pattern matching engine               │ │
│ │ - Emotion, character, object, color patterns implement et                  │ │
│ │ - Scoring ve ranking sistemi ekle                                          │ │
│ │ - Synonym expansion özelliği                                               │ │
│ │                                                                            │ │
│ │ 2. Admin Upload Enhancement                                                │ │
│ │                                                                            │ │
│ │ - Mevcut generateSmartTags fonksiyonunu güçlendir                          │ │
│ │ - Real-time tag generation (user title yazarken)                           │ │
│ │ - Tag edit/approve interface                                               │ │
│ │ - Custom tag ekleme yeteneği                                               │ │
│ │                                                                            │ │
│ │ 3. Integration & Testing                                                   │ │
│ │                                                                            │ │
│ │ - Upload flow'a entegre et                                                 │ │
│ │ - Popular tags API'sine bağla                                              │ │
│ │ - Existing sticker'lar için bulk tag generation                            │ │
│ │ - Tag filtering/search geliştir                                            │ │
│ │                                                                            │ │
│ │ 4. Kullanıcı Deneyimi                                                      │ │
│ │                                                                            │ │
│ │ - Auto-tag suggestions                                                     │ │
│ │ - Tag preview & approval                                                   │ │
│ │ - Batch tag editing                                                        │ │
│ │ - Tag analytics dashboard                                                  │ │
│ │                                                                            │ │
│ │ Dokümandaki TitleBasedTagGenerator class'ını referans alarak, mevcut       │ │
│ │ Next.js + Supabase architecture'ına uygun şekilde implement edeceğiz.
```

---

Update Todos
⎿ ☐ Create TitleBasedTagGenerator service in lib/tag-generator.ts
☐ Implement emotion patterns (happy, sad, angry, love, etc.)
☐ Implement character patterns (cowboy, pirate, ninja, etc.)
☐ Implement object and color patterns
☐ Add scoring and ranking system
☐ Add synonym expansion functionality
☐ Replace generateSmartTags in admin upload page
☐ Add real-time tag generation on title change
☐ Enhance tag editing interface in upload form
☐ Test the implementation with various sticker titles
