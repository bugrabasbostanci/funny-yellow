# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Funny Yellow is a free sticker platform built with Next.js, focusing on providing high-quality stickers for WhatsApp and other messaging platforms. The MVP phase provides a gallery of admin-curated stickers with WhatsApp integration, with all content completely free for users.

## Development Commands

```bash
# Development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 
- **UI Components**: Radix UI + Shadcn UI (New York style)
- **Typography**: Inter + Fredoka fonts from Google Fonts
- **Icons**: Lucide React

### Project Structure
- `/app` - Next.js App Router pages and layouts
- `/components` - Reusable React components
  - `/ui` - Shadcn UI components
  - Main feature components (sticker-gallery, auth-modal, etc.)
- `/lib` - Utility functions and context providers
- `/docs/PRDs` - Product requirements and design documentation

### Key Components
- `StickerGallery` - Main sticker browsing interface with search/filter
- `AuthProvider` - Context provider for user authentication (currently mock)
- `WhatsAppIntegration` - Handles sticker pack creation for WhatsApp
- `StickerCard` - Individual sticker display with like/download actions

### State Management
- React Context for authentication (`lib/auth-context.tsx`)
- Local state with useState/useEffect for component state
- localStorage for user session persistence

### Data Flow
- Mock data in components for MVP phase
- Auth state managed through AuthProvider context
- User favorites and download history stored in localStorage
- Authentication is currently mocked (ready for Supabase integration)

## UI/UX Guidelines

- **Color Scheme**: Yellow theme (#FFC107) with gradient backgrounds
- **Design Style**: Clean, minimal with generous whitespace
- **Mobile-First**: Responsive design prioritizing mobile experience
- **Typography**: Fredoka for headings (font-display), Inter for body text
- **Component Library**: Shadcn UI components with "new-york" style variant

## Development Notes

- TypeScript strict mode enabled
- Path aliases configured: `@/*` maps to project root
- Component library uses CSS variables for theming
- All stickers are completely free in MVP phase - no premium features or payments
- Authentication system prepared for Supabase but using localStorage mock
- WhatsApp integration exports 512x512 WebP format stickers

## Business Context

This is an MVP focusing on sticker gallery and WhatsApp integration with completely free access. The project follows a phased approach:

**Current MVP Phase**: Admin-curated stickers, free access, WhatsApp integration
**Phase 2**: User sticker uploads with content moderation
**Phase 3**: Sticker creation tools (crop, resize, format conversion)  
**Phase 4**: AI-powered quality enhancement and advanced features

**Important**: No premium features, payments, or monetization should be implemented in the MVP phase. All functionality must remain free for users.