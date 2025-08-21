# Pagination ve Loading Strategy

## Mevcut Durum
- Ana sayfada 40+ sticker aynı anda yükleniyor
- Load More butonu çalışmıyor
- Performance ve UX sorunları var

## Best Practices

### 1. Initial Load (İlk Yükleme)
- **Desktop**: 20-24 sticker optimal
- **Mobile**: 12-16 sticker optimal
- Sayfa hızla açılır, kullanıcı hemen içerik görür

### 2. Loading Strategies

#### A. Infinite Scroll (Önerilen)
**Avantajları:**
- Modern ve smooth UX
- Mobile-friendly
- Kesintisiz browsing deneyimi
- Social media platformlarında standart

**Disadvantajları:**
- Kullanıcı kontrolü az
- Memory usage artabilir
- SEO için pagination gerekebilir

#### B. Load More Button (Mevcut)
**Avantajları:**
- Kullanıcı kontrolünde
- Daha az bandwidth tüketimi
- Predictable performance
- Kolay implement

**Disadvantajları:**
- Extra click gerekiyor
- UX akışı kesiliyor

#### C. Traditional Pagination
**Avantajları:**
- SEO friendly
- Memory efficient
- Clear navigation
- Back button works

**Disadvantajları:**
- Eski UX pattern
- Mobile'da zor kullanım

### 3. Önerilen Implementation

```javascript
// Önerilen sayılar
const PAGINATION_CONFIG = {
  initialLoad: 20,        // İlk yükleme
  loadMoreSize: 12,       // Her "load more" click
  maxItemsBeforePagination: 200, // Pagination'a geçiş limiti
  
  // Mobile overrides
  mobile: {
    initialLoad: 12,
    loadMoreSize: 8
  }
}
```

### 4. Performance İyileştirmeleri

#### Image Optimization
- **Lazy loading** - Görünür olan sticker'lar yüklensin
- **WebP format** - Daha küçük dosya boyutu
- **Multiple sizes** - Responsive images
- **Skeleton loading** - Loading states

#### Memory Management
- **Virtual scrolling** - Çok fazla item için
- **Image unloading** - Scroll dışı kalan resimler temizlensin
- **Intersection Observer** - Performant scroll detection

### 5. UX İyileştirmeleri

#### Loading States
```javascript
// Loading durumları
- Initial loading (skeleton)
- Load more loading (spinner)
- End of content (message)
- Error states (retry button)
```

#### Search Integration
- Search yapılınca pagination reset
- Filter uygulanınca pagination reset
- Category değişince pagination reset

### 6. Implementation Plan

#### Faz 1: Basic Load More (Hızlı Win)
1. Initial load 20 sticker limit
2. Working "Load More" button
3. Basic loading states
4. Mobile responsive

#### Faz 2: Advanced Features
1. Lazy loading images
2. Skeleton loading states
3. Error handling
4. Memory optimization

#### Faz 3: Premium Features
1. Infinite scroll option
2. Virtual scrolling
3. Advanced image optimization
4. Analytics integration

## Technical Notes

### Database Queries
```sql
-- Offset/Limit pattern
SELECT * FROM stickers 
ORDER BY download_count DESC, created_at DESC 
LIMIT 20 OFFSET 0;

-- Cursor-based (daha performant)
SELECT * FROM stickers 
WHERE id < last_id 
ORDER BY download_count DESC, id DESC 
LIMIT 20;
```

### State Management
```javascript
const [stickers, setStickers] = useState([]);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);
const [page, setPage] = useState(1);
```

## Karar

**Önerilen yaklaşım: Load More Button (Faz 1)**
- Mevcut kodla uyumlu
- Hızlı implement
- İyi UX/performance balance
- Gelecekte infinite scroll'a upgrade kolay

**Sonraki adım: Faz 1 implementation**