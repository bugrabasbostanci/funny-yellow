# Rate Limiting Strategy

## Mevcut Durum

Projede şu anda sadece client-side debouncing koruması mevcut:
- `sticker-card.tsx`: 1 saniye debounce
- Sunucu tarafında rate limiting yok
- Bulk download işlemlerinde koruma yok

## Neden Rate Limiting Gerekli?

### 1. Resource Protection
- Eşzamanlı download'lar sunucu yükünü artırır
- Database query'leri yoğunlaşabilir
- CDN bandwidth maliyetleri kontrolsüz artabilir

### 2. Abuse Prevention  
- Bot'lar tüm sticker koleksiyonunu toplu çekebilir
- Scraping saldırılarından korunma
- API endpoint'lerinin kötüye kullanımını engelleme

### 3. Fair Usage
- Kullanıcı başına adil kaynak dağılımı
- Hizmet kalitesinin korunması
- Sistem stabilitesinin sağlanması

## Rate Limiting Stratejileri

### Strateji 1: Memory-Based (Basit)
```typescript
// In-memory rate limiting
// Development ve küçük projeler için
// Server restart'ta sıfırlanır

Limits:
- IP bazlı: 50 download/dakika
- Bulk operations: 5 işlem/saat
```

### Strateji 2: Redis-Based (Production)
```typescript
// Redis ile persistent rate limiting
// Cluster'lar arası synchronization
// Production environment için ideal

Limits:
- IP bazlı: 100 download/dakika
- User bazlı: 200 download/saat
- Bulk operations: 10 işlem/gün
```

### Strateji 3: Hybrid Approach
```typescript
// Memory + Redis kombinasyonu
// Fast checks + persistent storage
// Optimal performance

Primary: Memory cache (1 dakika)
Fallback: Redis (1 saat)
```

## Önerilen Implementasyon

### Aşama 1: API Route Middleware
```typescript
// app/api/middleware/rate-limit.ts
export async function rateLimit(request: Request, limits: RateLimitConfig)
```

### Aşama 2: Download Endpoint'leri
- `/api/download/sticker/[id]` - Tekli download
- `/api/download/bulk` - Toplu download
- `/api/download/whatsapp-pack` - WhatsApp pack

### Aşama 3: Rate Limit Rules
```typescript
const RATE_LIMITS = {
  SINGLE_DOWNLOAD: { requests: 50, window: 60 * 1000 }, // 50/dakika
  BULK_DOWNLOAD: { requests: 5, window: 60 * 60 * 1000 }, // 5/saat
  WHATSAPP_PACK: { requests: 3, window: 60 * 60 * 1000 }, // 3/saat
}
```

## Response Headers

Rate limit bilgileri header'larda döndürülecek:
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42  
X-RateLimit-Reset: 1634567890
X-RateLimit-Retry-After: 30
```

## Error Handling

429 Too Many Requests response:
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many downloads. Try again in 30 seconds.",
  "retryAfter": 30
}
```

## Monitoring

Rate limiting metrics:
- Total requests per endpoint
- Blocked requests count
- Top IP addresses by request volume
- Average response times

## Migration Plan

1. **Development Phase**: Memory-based implementation
2. **Testing Phase**: Redis integration + monitoring
3. **Production Phase**: Full deployment + fine-tuning

## Configuration

Environment variables:
```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379
RATE_LIMIT_SINGLE_DOWNLOAD_LIMIT=50
RATE_LIMIT_BULK_DOWNLOAD_LIMIT=5
```