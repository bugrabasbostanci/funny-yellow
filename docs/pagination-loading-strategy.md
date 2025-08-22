# Pagination & Loading Strategy

## Overview

Funny Yellow sticker gallery için pagination ve loading stratejisi. Kullanıcı deneyimini optimize etmek ve performance'ı artırmak için tasarlanmıştır.

## Current Implementation Status

### MVP Approach (Phase 1)
- **Strategy**: Client-side filtering with all data loaded
- **Sticker Count**: ~77 stickers (manageable size)
- **Loading**: Single API call on page load
- **Filtering**: Real-time search and tag filtering

### Performance Considerations
- Initial load: ~2-3MB total (WebP optimized)
- Search response: Instant (client-side)
- Mobile performance: Acceptable for MVP size

## Future Pagination Strategy

### Phase 2: Server-Side Pagination

#### Technical Implementation
```typescript
interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  tags?: string[];
  sort_by?: 'popularity' | 'newest' | 'name';
  order?: 'asc' | 'desc';
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}
```

#### API Endpoints
```typescript
// GET /api/stickers?page=1&limit=24&search=happy&tags=emoji,funny
const getStickersPaginated = async (params: PaginationParams) => {
  const response = await fetch(`/api/stickers?${new URLSearchParams(params)}`);
  return response.json() as PaginatedResponse<Sticker>;
};
```

## Loading Strategies

### 1. Infinite Scroll (Recommended)

#### Benefits
- Seamless user experience
- Mobile-friendly
- Natural browsing behavior
- No pagination UI complexity

#### Implementation
```typescript
const useInfiniteScroll = () => {
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const response = await getStickersPaginated({ 
        page, 
        limit: 24 
      });
      
      setStickers(prev => [...prev, ...response.data]);
      setHasMore(response.pagination.has_next);
      setPage(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  return { stickers, loading, hasMore, loadMore };
};
```

#### Scroll Detection
```typescript
const useScrollDetection = (callback: () => void) => {
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      
      // Trigger load more when 200px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        callback();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback]);
};
```

### 2. Traditional Pagination

#### Use Cases
- Admin panels
- Search results
- Specific page navigation needs

#### Implementation
```typescript
const PaginationControls = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: PaginationProps) => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Button 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </Button>
      
      <span>Page {currentPage} of {totalPages}</span>
      
      <Button 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );
};
```

### 3. Hybrid Approach (Phase 3+)

#### Smart Loading
- First 24 stickers: Instant load
- Next pages: Infinite scroll
- Search results: Traditional pagination
- Popular stickers: Cached/preloaded

## Performance Optimization

### Image Loading Strategy

#### Lazy Loading
```typescript
const LazyImage = ({ src, alt, ...props }: ImageProps) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={inView ? src : '/placeholder.webp'}
      alt={alt}
      loading="lazy"
      {...props}
    />
  );
};
```

#### Progressive Enhancement
```typescript
const StickerCard = ({ sticker }: { sticker: Sticker }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <Card className="relative">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      
      <img
        src={sticker.file_path}
        alt={sticker.name}
        onLoad={() => setImageLoaded(true)}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </Card>
  );
};
```

### Caching Strategy

#### Browser Cache
```typescript
// Service Worker for sticker caching
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/stickers/webp/')) {
    event.respondWith(
      caches.open('stickers-v1').then(cache => {
        return cache.match(event.request).then(response => {
          return response || fetch(event.request).then(fetchResponse => {
            cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
  }
});
```

#### Memory Cache
```typescript
const stickerCache = new Map<string, Sticker[]>();

const useCachedStickers = (cacheKey: string) => {
  const [stickers, setStickers] = useState<Sticker[]>(
    stickerCache.get(cacheKey) || []
  );

  const updateCache = useCallback((newStickers: Sticker[]) => {
    stickerCache.set(cacheKey, newStickers);
    setStickers(newStickers);
  }, [cacheKey]);

  return { stickers, updateCache };
};
```

## Search & Filter Integration

### Debounced Search
```typescript
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

const SearchWithPagination = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Reset pagination and fetch new results
    resetPagination();
    fetchStickers({ search: debouncedSearch, page: 1 });
  }, [debouncedSearch]);
};
```

### Filter State Management
```typescript
interface FilterState {
  search: string;
  tags: string[];
  sortBy: 'popularity' | 'newest' | 'name';
  order: 'asc' | 'desc';
}

const useFilteredPagination = () => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    tags: [],
    sortBy: 'popularity',
    order: 'desc'
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return { filters, setFilters, currentPage, setCurrentPage };
};
```

## Database Query Optimization

### Efficient Pagination Queries
```sql
-- Optimized pagination with search
SELECT s.*,
       COUNT(*) OVER() as total_count
FROM stickers s
WHERE ($1::text IS NULL OR s.name ILIKE $1::text)
  AND ($2::text[] IS NULL OR s.tags && $2::text[])
ORDER BY 
  CASE WHEN $5 = 'popularity' THEN s.download_count END DESC,
  CASE WHEN $5 = 'newest' THEN s.created_at END DESC,
  CASE WHEN $5 = 'name' THEN s.name END ASC
LIMIT $3 OFFSET $4;
```

### Indexing Strategy
```sql
-- Performance indexes
CREATE INDEX idx_stickers_tags ON stickers USING GIN(tags);
CREATE INDEX idx_stickers_name ON stickers(name);
CREATE INDEX idx_stickers_download_count ON stickers(download_count DESC);
CREATE INDEX idx_stickers_created_at ON stickers(created_at DESC);
```

## Mobile Considerations

### Touch-Friendly Navigation
- Infinite scroll preferred over pagination buttons
- Large touch targets for mobile
- Pull-to-refresh for updated content
- Swipe gestures for navigation

### Performance on Mobile
- Smaller initial load (12 stickers on mobile)
- WebP format for bandwidth optimization
- Progressive image loading
- Reduced animation on slower devices

## Analytics & Monitoring

### Key Metrics
- Average time to first sticker load
- Bounce rate by pagination type
- Search result click-through rate
- Infinite scroll engagement depth

### Performance Monitoring
```typescript
// Load time tracking
const trackLoadTime = () => {
  const startTime = performance.now();
  
  return () => {
    const loadTime = performance.now() - startTime;
    analytics.track('sticker_load_time', { duration: loadTime });
  };
};
```

## Implementation Timeline

### Phase 1 (Current MVP)
- ✅ Client-side filtering (completed)
- ✅ Simple loading state (completed)

### Phase 2 (Next 2-3 weeks)
- 🔄 Server-side pagination API
- 🔄 Infinite scroll implementation  
- 🔄 Lazy loading images

### Phase 3 (4-6 weeks)
- 🔄 Advanced caching strategy
- 🔄 Service worker implementation
- 🔄 Performance monitoring

### Phase 4 (Post-scale)
- 🔄 CDN integration
- 🔄 Global cache distribution
- 🔄 Advanced search algorithms

---

**Performance Target**: < 2s first contentful paint, < 1s subsequent page loads  
**Scalability Target**: Support 10,000+ stickers with maintained performance