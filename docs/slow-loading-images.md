Hızlı Çözüm Önerileri:

1. Image Component'ini Optimize Et (Hemen)

sticker-card.tsx'a ekle:
<Image
src={imageUrl || "/placeholder.svg"}
alt={name}
fill
loading="lazy" // ← EKLE
priority={false} // ← EKLE
placeholder="blur" // ← EKLE
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

2. Gerçek Server-Side Pagination (1-2 gün)

database-service.ts'ye yeni method:
static async getStickersPaginated(limit: number, offset: number) {
const { data, error, count } = await supabase
.from("stickers")
.select("\*", { count: 'exact' })
.range(offset, offset + limit - 1)
.order("created_at", { ascending: false });

    return {
      stickers: data || [],
      hasMore: (offset + limit) < (count || 0)
    };

}

3. Intersection Observer ile Gerçek Lazy Loading

sticker-pagination.tsx'deki threshold'u artır:
const observer = new IntersectionObserver(
(entries) => {
if (entries[0].isIntersecting && hasMore) {
loadMoreStickers();
}
},
{
threshold: 0.3, // 0.1'den 0.3'e çıkar
rootMargin: '100px' // Erkenden yükle
}
);
