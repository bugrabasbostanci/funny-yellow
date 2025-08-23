<div align="center">
  <img src="public/funny-yellow-logo.svg" alt="Funny Yellow Logo" width="120" height="120">
  
  # Funny Yellow - Free Sticker Platform
</div>

A high-quality sticker platform built with Next.js, focusing on providing free stickers for WhatsApp and other messaging platforms.

## 🎯 Project Vision

Funny Yellow aims to solve the problem of low-quality stickers in social media and messaging platforms. We provide high-quality, optimized stickers that work perfectly across WhatsApp, Discord, Twitch, and other platforms.

**"Make Chat Fun Again!"**

## 🚀 Current Phase: MVP

- **Focus**: Admin-curated, free stickers for everyone
- **Primary Platform**: WhatsApp integration with 512x512 WebP format
- **No Premium Features**: Everything is free in this phase
- **Future Phases**: User uploads → Sticker creation tools → AI quality enhancement

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + Shadcn UI (New York style)
- **Typography**: Inter + Fredoka fonts from Google Fonts
- **Icons**: Lucide React

### Architecture

- **State Management**: React Context + localStorage
- **Authentication**: Dual system (User + Admin with separate contexts)
- **Database**: Supabase with Edge Runtime compatibility
- **Image Processing**: WebP optimization pipeline for WhatsApp compatibility
- **Admin System**: Protected routes with authentication and role-based access
- **Design**: Mobile-first responsive approach

## 📁 Project Structure

```
funny-yellow/
├── app/                           # Next.js App Router
│   ├── admin/                    # Admin panel pages
│   │   ├── gallery/             # Sticker management
│   │   ├── packs/               # Pack management (create/edit)
│   │   ├── upload/              # Batch upload interface
│   │   └── scripts/             # Admin script execution
│   ├── api/                     # API routes
│   │   └── admin/              # Admin API endpoints
│   ├── packs/                   # Public pack browsing
│   ├── layout.tsx              # Root layout with fonts and providers
│   └── page.tsx                # Main sticker gallery page
├── components/                   # React components
│   ├── ui/                     # Shadcn UI base components
│   ├── sticker-gallery/        # Main gallery interface
│   ├── hero-section/           # Landing page hero
│   ├── admin-auth-modal/       # Admin authentication
│   └── admin-route-guard/      # Admin route protection
├── lib/                         # Utilities and context providers
│   ├── auth-context.tsx        # User authentication state
│   ├── admin-auth-context.tsx  # Admin authentication state
│   └── utils.ts                # Helper functions
├── scripts/                     # Automation scripts
│   ├── download-and-optimize.js # Sticker processing pipeline
│   ├── upload-to-supabase-admin.js # Database upload
│   └── setup-database.js       # Database initialization
└── docs/                        # Project documentation
    ├── PRDs/                   # Product requirements
    ├── admin/                  # Admin guides
    └── notes/                  # Development notes
```

## 🎨 Design System

- **Primary Color**: Yellow (#FFC107) - represents fun and energy
- **Theme**: Clean, minimal with generous whitespace
- **Typography**: Fredoka for headings, Inter for body text
- **Mobile-First**: Optimized for mobile messaging platforms
- **Component Style**: Shadcn UI "new-york" variant

## 🔧 Key Features

### Current MVP Features

- ✅ **Sticker Gallery**: Browse categorized stickers (Funny Emoji, Reactions, Memes, etc.)
- ✅ **Search & Filter**: Advanced search with tag and category filtering
- ✅ **WhatsApp Integration**: Direct sticker pack creation (max 30 stickers)
- ✅ **Format Optimization**: 512x512 WebP format for perfect WhatsApp compatibility
- ✅ **Mobile-First Design**: Responsive design optimized for mobile devices
- ✅ **User Favorites**: Favorite system with localStorage persistence
- ✅ **Download Tracking**: User download history and analytics
- ✅ **Admin Panel**: Complete admin system for content management
- ✅ **Pack Management**: Create, edit, and organize sticker packs
- ✅ **Batch Processing**: Bulk sticker upload and processing pipeline
- ✅ **Real-time Analytics**: Dashboard with usage statistics and metrics

### Planned Features (Future Phases)

- 📋 **User Uploads**: Community sticker submissions with moderation
- 🛠 **Creation Tools**: In-browser sticker editing (crop, resize, effects)
- 🤖 **AI Enhancement**: Automatic background removal and quality improvement
- 📱 **Multi-platform**: Support for Telegram, Discord, iMessage formats
- 👥 **Community**: User profiles, collections, and social features

## 🎯 Target Audience

- **Primary**: 16-35 age group using WhatsApp, Instagram, Discord
- **Secondary**: Content creators, streamers, social media influencers
- **Focus**: Users seeking high-quality, fun stickers for digital communication

## 🚦 Development Phases

### Phase 1 (MVP - Current) ✅

- ✅ Admin-curated sticker gallery with advanced search
- ✅ Complete admin panel with authentication
- ✅ WhatsApp integration with pack creation
- ✅ Pack management system (create, edit, organize)
- ✅ Batch processing pipeline for bulk uploads
- ✅ Real-time analytics and dashboard
- ✅ User favorites and download tracking

### Phase 2 (Next)

- 📋 User sticker uploads with content moderation
- 🛡️ NSFW content filtering and safety measures
- ⚖️ Copyright validation and takedown system
- 🔍 Community reporting and review system

### Phase 3 (Future)

- 🎨 In-browser sticker creation tools (crop, resize, format conversion)
- 🖼️ Background removal and transparency features
- ✨ Quality filters, effects, and enhancement tools
- 🎭 Template system for quick sticker creation

### Phase 4 (Advanced)

- 🤖 AI-powered quality enhancement and upscaling
- 🧹 Automatic background cleaning and optimization
- 🎨 Style transfer and artistic effect capabilities
- 🔮 Smart categorization and tagging

## 📊 Success Metrics (MVP Goals)

- 1000+ registered users (first month)
- 5000+ sticker downloads (first month)
- 20% user return rate
- 3+ minutes average session duration

## 🤝 Contributing

This is currently a closed MVP development. Future phases will include community contributions.

## 📝 Development Notes

- **Free Platform**: All stickers are free during MVP phase, no premium features
- **Dual Authentication**: Separate user and admin authentication systems
- **Database**: Supabase integration with Edge Runtime compatibility
- **Image Processing**: Automated pipeline for WebP optimization and format conversion
- **Admin System**: Complete content management with protected routes
- **Batch Operations**: Bulk upload and processing capabilities for efficient content management
- **Component Library**: Shadcn UI with CSS variables for consistent theming
- **Code Quality**: TypeScript strict mode and comprehensive linting enabled

## 🔑 Admin System

The platform includes a comprehensive admin system for content management:

### Authentication
- Secure admin login with environment-based credentials
- 24-hour session timeout with localStorage persistence
- Protected routes with automatic redirect for unauthorized access

### Content Management
- **Sticker Gallery**: View, edit, and manage all stickers
- **Pack Management**: Create, edit, and organize sticker packs
- **Batch Upload**: Bulk sticker processing with real-time progress
- **Analytics Dashboard**: Usage statistics and download metrics

### Scripts & Automation
- Automated sticker optimization pipeline
- Database upload and management tools
- Content processing and format conversion scripts

## 🔗 Related Documentation

- `CLAUDE.md` - Development guidance for AI assistance
- `docs/PRDs/main-prd.md` - Detailed product requirements
- `docs/notes/main-prd-and-design.md` - Design decisions and notes

---

**Made with 💛 by the Funny Yellow Team**
