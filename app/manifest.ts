import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Funny Yellow - Free WhatsApp Stickers',
    short_name: 'Funny Yellow',
    description: 'Download high-quality, funny stickers for WhatsApp instantly. 100% free sticker collection.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fefce8',
    theme_color: '#ffc107',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['entertainment', 'social'],
    lang: 'en',
    orientation: 'portrait',
  }
}