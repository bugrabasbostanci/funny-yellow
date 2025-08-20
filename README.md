# Funny Yellow - Free Sticker Platform 🟡

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
- **Authentication**: Mock system (prepared for Supabase)
- **Image Format**: WebP optimization for WhatsApp compatibility
- **Design**: Mobile-first responsive approach

## 📁 Project Structure

```
funny-yellow/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with fonts and providers
│   └── page.tsx           # Main sticker gallery page
├── components/            # React components
│   ├── ui/               # Shadcn UI base components
│   ├── sticker-gallery/  # Main gallery interface
│   ├── hero-section/     # Landing page hero
│   └── auth-modal/       # Authentication components
├── lib/                  # Utilities and context providers
│   ├── auth-context.tsx  # Authentication state management
│   └── utils.ts          # Helper functions
└── docs/                 # Project documentation
    ├── PRDs/            # Product requirements
    └── notes/           # Development notes
```

## 🎨 Design System

- **Primary Color**: Yellow (#FFC107) - represents fun and energy
- **Theme**: Clean, minimal with generous whitespace
- **Typography**: Fredoka for headings, Inter for body text
- **Mobile-First**: Optimized for mobile messaging platforms
- **Component Style**: Shadcn UI "new-york" variant

## 🔧 Key Features

### Current MVP Features
- ✅ Sticker gallery with categories (Funny Emoji, Reactions, Memes, etc.)
- ✅ Search and filter functionality
- ✅ WhatsApp sticker pack creation (max 30 stickers)
- ✅ 512x512 WebP format optimization
- ✅ Mobile-responsive design
- ✅ Favorites system (localStorage)
- ✅ Download history tracking

### Planned Features (Future Phases)
- 📋 User sticker uploads
- 🛠 Sticker creation and editing tools
- 🤖 AI-powered quality enhancement
- 📱 Multi-platform support (Telegram, Discord, iMessage)
- 👥 Community features and user profiles

## 🎯 Target Audience

- **Primary**: 16-35 age group using WhatsApp, Instagram, Discord
- **Secondary**: Content creators, streamers, social media influencers
- **Focus**: Users seeking high-quality, fun stickers for digital communication

## 🚦 Development Phases

### Phase 1 (MVP - Current) 
- Admin-curated sticker gallery
- WhatsApp integration
- Basic user system with favorites

### Phase 2 (Next)
- User sticker uploads with moderation
- NSFW content filtering
- Copyright validation system

### Phase 3 (Future)
- Sticker creation tools (crop, resize, format conversion)
- Background removal features
- Quality filters and effects

### Phase 4 (Advanced)
- AI-powered quality enhancement
- Automatic background cleaning
- Style transfer capabilities

## 📊 Success Metrics (MVP Goals)

- 1000+ registered users (first month)
- 5000+ sticker downloads (first month)
- 20% user return rate
- 3+ minutes average session duration

## 🤝 Contributing

This is currently a closed MVP development. Future phases will include community contributions.

## 📝 Development Notes

- All stickers are free during MVP phase
- Authentication system is mocked but ready for Supabase integration
- Image handling optimized for WhatsApp's format requirements
- Component library uses CSS variables for easy theming
- TypeScript strict mode enabled for code quality

## 🔗 Related Documentation

- `CLAUDE.md` - Development guidance for AI assistance
- `docs/PRDs/main-prd.md` - Detailed product requirements
- `docs/notes/main-prd-and-design.md` - Design decisions and notes

---

**Made with 💛 by the Funny Yellow Team**
