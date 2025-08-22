Admin Upload Pipeline Gerçekleştirme Planı

    📋 Mevcut Durum Analizi

    - ✅ Admin sayfaları UI'ları hazır ama mock verilerle çalışıyor
    - ✅ Manuel upload script'leri (optimize-stickers, upload-to-supabase-admin, convert-webp-to-png)
    mevcut
    - ❌ Admin upload sayfası gerçek dosya yüklemiyor
    - ❌ Gallery sayfası mock veriler gösteriyor
    - ❌ Scripts sayfası gerçek script'leri çalıştırmıyor

    🎯 Implementasyon Planı

    Phase 1: API Routes Oluşturma

    1. /api/admin/upload-files - Multipart file upload
    2. /api/admin/stickers - Supabase CRUD operations (GET, PUT, DELETE)
    3. /api/admin/run-script - Script execution with real-time output
    4. /api/admin/process-files - Optimize & convert pipeline

    Phase 2: Upload Sayfası Güncelleme

    - Gerçek file upload fonksiyonalitesi
    - Progress tracking & real-time feedback
    - Metadata yönetimi (name, tags)
    - Hata yakalama ve kullanıcı geri bildirim

    Phase 3: Gallery Sayfası Entegrasyonu

    - Supabase'den gerçek sticker verilerini çekme
    - Gerçek sticker görüntülerini display etme
    - Edit/Delete CRUD işlemleri
    - Search ve filtering

    Phase 4: Scripts Sayfası Gerçekleştirme

    - Mevcut script'leri (npm run optimize-stickers, etc.) API üzerinden çalıştırma
    - Real-time output streaming
    - Process status tracking
    - Error handling ve logging

    🔄 Technical Implementation

    - Next.js App Router API routes kullanımı
    - Supabase client entegrasyonu (admin operations)
    - File upload handling (multipart forms)
    - Child process execution için Node.js spawn/exec
    - Real-time updates için Server-Sent Events veya WebSocket
    - Error boundaries ve user feedback

    📝 Sonuç

    Bu plan ile manuel sticker yükleme sürecini tamamen otomatize eden, admin-friendly bir interface
    oluşturacağız. Mevcut script'ler korunacak, sadece web arayüzü üzerinden çalışır hale getirilecek.
