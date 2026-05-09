# Design System — GymCat.es

> Inspired by Cal.com's monochromatic restraint. A grayscale world where boldness comes not from color but from the sheer confidence of black text on white space.

## 1. Visual Theme

Purely grayscale palette. Color is treated as a foreign substance — when it appears (a rare blue link, a green status badge), it feels like a controlled accent. The philosophy mirrors Uber's approach: let the content carry color, the frame stays neutral.

**Key Characteristics:**
- Purely grayscale brand palette — no brand colors
- Inter for body, Cal Sans for headings (loaded via Google Fonts CDN)
- Multi-layered shadow system with ring borders + diffused shadows
- White canvas with near-black (`#242424`) text — maximum contrast, zero decoration
- Product screenshots/gym images as primary visual content

## 2. Color Palette

| Role | Value | Usage |
|---|---|---|
| Primary Text | `#242424` (Charcoal) | Headings, buttons, primary UI |
| Secondary Text | `#898989` (Mid Gray) | Descriptions, muted labels |
| Link | `#0099ff` (Link Blue) | In-text hyperlinks with underline |
| Background | `#ffffff` (White) | Page background, cards |
| Off-white | `#f5f5f5` | Section differentiation |
| Button BG | `#242424` | CTAs, primary actions |
| Success | `#22c55e` / `#166534` | Status indicators |
| Error | `#ef4444` / `#991b1b` | Error states |

## 3. Typography

| Role | Font | Size | Weight | Line Height |
|---|---|---|---|---|
| Display Hero | Cal Sans | 64px | 600 | 1.10 |
| Section Heading | Cal Sans | 36–48px | 600 | 1.10 |
| Card Title | Inter | 16px | 600 | 1.30 |
| Body | Inter | 14–16px | 300–400 | 1.50 |
| Caption | Inter | 12–13px | 400–500 | 1.40 |
| Mono (prices) | Roboto Mono | 14–16px | 600 | 1.20 |
| Mono (labels) | Roboto Mono | 12px | 400 | 1.10 |

**Rules:**
- Cal Sans only for headings ≥ 24px
- Inter for all body text
- Roboto Mono for prices, data, and technical content
- Weight 600 dominates Cal Sans usage
- Weight 300 body variant creates elegant, airy contrast

## 4. Component Styles

### Buttons
- **Dark Primary**: `#242424` bg, white text, 6–8px radius, hover opacity 0.9
- **Ghost**: White bg, shadow-ring border, dark text
- **Pill**: 9999px radius for badges, facility chips
- **Compact**: 4px padding for utility actions

### Cards
- **Shadow**: `rgba(19,19,22,0.7) 0px 1px 5px -4px, rgba(34,42,53,0.08) 0px 0px 0px 1px, rgba(34,42,53,0.05) 0px 4px 8px`
- **Radius**: 8px standard, 12px large
- **Hover**: Subtle shadow deepening

### Inputs
- White bg, 1px solid `#ddd` border, 6–8px radius
- Focus: `#242424` border color
- Labels: 12px uppercase, weight 600, `#555`

### Navigation
- White/transparent bg
- Inter links at `#111111`
- CTA button: Dark Primary
- Mobile: hamburger menu
- Sticky: fixed on scroll

## 5. Elevation System

| Level | Treatment | Use |
|---|---|---|
| Flat | No shadow | Page canvas |
| Card | Ring + Soft shadow stack | Cards, containers |
| Button Inset | White `0px 2px 0px inset` | 3D pressed effect |
| Soft Only | `rgba(34,42,53,0.05) 0px 4px 8px` | Ambient depth |

## 6. Spacing

- **Base unit**: 8px
- **Scale**: 4, 8, 12, 16, 20, 24, 32, 48, 64, 80, 96px
- **Section padding**: 48–96px vertical
- **Card padding**: 16–24px
- **Gap**: 8–16px between related elements
- **Container**: max 1200px, centered

## 7. Icon System

**NO emojis anywhere.** All icons are inline SVGs with `stroke="currentColor"` and `fill="none"`. This ensures:
- Consistent rendering across platforms
- Color inheritance from parent text color
- Crisp at any size
- No dependency on emoji font availability

SVG icon pattern:
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="..." />
</svg>
```

## 8. Responsive

| Breakpoint | Width | Behavior |
|---|---|---|
| Mobile | <640px | Single column, stacked |
| Tablet | 640–1024px | 2-column grids |
| Desktop | >1024px | Full layout, 3–4 column grids |

**Rules:**
- Mobile-first CSS
- Cards stack vertically on mobile
- Tables become scrollable (`overflow-x: auto`)
- Modals go full-width on mobile
- Gallery switches from 3-col to 1-col
- Font sizes reduce ~20% on mobile

## 9. Do's and Don'ts

### Do
- Use Cal Sans for headings ≥ 24px, Inter for body
- Maintain grayscale palette — boldness from contrast, not color
- Use multi-layered shadow system for card elevation
- Keep backgrounds pure white
- Use inline SVGs for all icons (never emojis)
- Apply generous section spacing (48px+)
- Use Roboto Mono for prices and data

### Don't
- Use emojis as icons — always SVGs
- Add brand colors to the marketing site
- Use CSS borders when shadows work
- Reduce section spacing below 24px
- Mix Cal Sans weights at small sizes
- Use illustrations or decorative graphics
