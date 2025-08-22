# Funny Yellow - Color Palette

## Primary Colors

### Yellow Theme
- **Primary Yellow**: `#FFC107` - Ana sarı renk
- **Light Yellow**: `#FFECB3` - Açık sarı tonları 
- **Dark Yellow**: `#FF8F00` - Koyu sarı vurgular

### Supporting Colors
- **White**: `#FFFFFF` - Ana arka plan
- **Gray-50**: `#F9FAFB` - Açık gri arka planlar
- **Gray-100**: `#F3F4F6` - Hafif gri borders
- **Gray-500**: `#6B7280` - İkincil metin
- **Gray-900**: `#111827` - Ana metin

### Status Colors
- **Success Green**: `#10B981` - Başarılı işlemler
- **Error Red**: `#EF4444` - Hata durumları
- **Warning Orange**: `#F59E0B` - Uyarılar

## Gradient System

### Background Gradients
```css
.bg-gradient-yellow {
  background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%);
}

.bg-gradient-light {
  background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
}
```

### Text Gradients
```css
.text-gradient-yellow {
  background: linear-gradient(135deg, #FFC107 0%, #FF8F00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Usage Guidelines

### Primary Actions
- Buttons: `bg-yellow-400` (#FFC107)
- Hover: `bg-yellow-500` (#FF8F00)

### Secondary Elements
- Borders: `border-gray-200`
- Cards: `bg-white` with `shadow-sm`

### Text Hierarchy
- Headings: `text-gray-900` (Fredoka font)
- Body: `text-gray-700` (Inter font)  
- Secondary: `text-gray-500`

### Interactive States
- Hover: Darker shade (+100)
- Active: Darker shade (+200)
- Focus: Ring with primary color

## Component Color Usage

### StickerCard
- Background: `bg-white`
- Border: `border-gray-200`  
- Like button: `text-yellow-500` when active

### Header
- Background: `bg-white/80 backdrop-blur`
- Logo: Yellow gradient

### Footer
- Background: `bg-gray-50`
- Text: `text-gray-600`

## Accessibility

- Contrast ratio minimum: 4.5:1 for normal text
- Contrast ratio minimum: 3:1 for large text
- Color combinations tested with WCAG AA standards

## Tailwind Configuration

Colors are configured in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEB',
          400: '#FFC107', 
          500: '#FF8F00',
        }
      }
    }
  }
}
```