# Visual Identity

The design language is **glassmorphism over a purple-to-violet gradient**. Every page shares the same fixed background; content floats on top as white cards or translucent glass panels.

## Color Palette

All colors are defined as CSS custom properties in `:root` (`globals.css`). Never hardcode hex values in components.

| Token              | Value              | Role                                                  |
|--------------------|--------------------|-------------------------------------------------------|
| `--primary`        | `#6C5CE7`          | Purple — dominant: buttons, headings, links, borders  |
| `--primary-dark`   | `#5A4BD1`          | Darker purple — hover states on primary elements      |
| `--accent`         | `#FF6B8A`          | Pink-red — secondary accents, badges, gradient pairs  |
| `--success`        | `#00B894`          | Teal-green — confirmed status, positive indicators    |
| `--warning`        | `#FDCB6E`          | Amber — stat numbers, pending status, highlights      |
| `--dark`           | `#2D3436`          | Near-black — body text on white cards                 |
| `--light`          | `#F5F6FA`          | Off-white — card backgrounds, meta boxes              |
| `--glass`          | `rgba(255,255,255,0.12)` | Translucent white — glass panels on gradient     |
| `--glass-border`   | `rgba(255,255,255,0.25)` | Glass panel borders                              |
| `--grad-start`     | `#667eea`          | Body background gradient start (top-left)             |
| `--grad-end`       | `#764ba2`          | Body background gradient end (bottom-right)           |

### Background
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
background-attachment: fixed; /* parallax effect on scroll */
```
A subtle SVG fractal noise overlay (`opacity: 0.04`) adds texture depth.

## City Accent Colors

Each destination city has its own accent used for timeline dots, card left-borders, highlight bars, and detail labels:

| Variable | Value     | City       |
|----------|-----------|------------|
| `--c1`   | `#6C5CE7` | Dublin (1st stay) |
| `--c2`   | `#FF6B8A` | Belfast     |
| `--c3`   | `#00B894` | Edinburgh   |
| `--c4`   | `#0984E3` | Liverpool   |
| `--c5`   | `#D63031` | Londres     |
| `--c6`   | `#FDCB6E` | Dublin (2nd stay) |

## Typography

- **Font family**: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` — system stack, no web font import needed.
- **Headings**: `font-weight: 800`, large `clamp()` sizes for responsive scaling.
- **Section labels**: `uppercase`, `letter-spacing: 2px`, `font-weight: 700` — used for section titles.
- **Body/meta**: `font-weight: 500`; muted text at `opacity: 0.85` or `color: #636E72`.

## Spacing & Shape

- **Border radius**: Cards use `18px`; smaller elements (`10px`–`14px`); pills/badges use `20px` (fully rounded).
- **Max content width**: `1000px`, centered with `margin: 0 auto` and `padding: 0 1.5rem`.
- **Card shadow**: `0 8px 32px rgba(0,0,0,0.1)` at rest → `0 18px 52px rgba(0,0,0,0.14)` on hover.

## Interaction Patterns

- **Hover lift**: White cards lift `translateY(-4px)` to `-6px` on hover with shadow deepening.
- **Transport card hover**: Slides right `translateX(4px)` instead of lifting (horizontal list feel).
- **Entry animations**: `fadeInUp` (content) and `slideDown` (headers) — staggered `0.1s` per item, `0.6s` duration.
- **Glassmorphism hover**: Glass panels increase background opacity from `0.12` → `0.18` or `0.20` on hover.

## Component Visual Patterns

### Glass panels (on gradient background)
```css
background: var(--glass);             /* rgba(255,255,255,0.12) */
backdrop-filter: blur(16px);
border: 1px solid var(--glass-border);
border-radius: 16px;
color: white;
```
Used for: stat cards, route city chips, summary bars, highlight chips.

### White cards (primary content)
```css
background: white;
border-radius: 18px;
box-shadow: 0 8px 32px rgba(0,0,0,0.1);
```
Used for: hotel cards, transport cards, city cards, totals card. Always have a colored accent — either a top stripe (`::before`, 4px) or a left border (4px).

### Top stripe (hotel/transport cards)
```css
/* Confirmed */
background: linear-gradient(90deg, var(--primary), var(--accent));
/* Pending */
background: linear-gradient(90deg, var(--warning), #e9b000);
```

### Left border (city timeline cards)
4px solid border using the city's accent color (`--c1` through `--c6`).

### Badges / Pills
```css
/* Primary */
background: rgba(108,92,231,0.1); color: var(--primary); border: 1px solid rgba(108,92,231,0.25);
/* Success */
background: rgba(0,184,148,0.1);  color: var(--success); border: 1px solid rgba(0,184,148,0.25);
/* Warning */
background: rgba(253,203,110,0.15); color: #b8860b;      border: 1px solid rgba(253,203,110,0.5);
/* Danger/Highlight */
background: rgba(214,48,49,0.1);  color: var(--c5);      border: 1px solid rgba(214,48,49,0.25);
```
Always `border-radius: 20px`, `font-size: 0.78rem`, `font-weight: 600`.

### Highlight bars (city cards)
Full-width gradient bars inside white cards, matching the city accent:
```css
background: linear-gradient(90deg, var(--c1), var(--c2)); /* Dublin */
color: white; border-radius: 10px; padding: 0.85rem 1rem;
```

### Stat numbers
`font-size: 2.4rem`, `font-weight: 800`, `color: var(--warning)` — amber makes numbers pop on glass.

## Navigation

### Desktop (≥ 769px)
Sticky top nav, `backdrop-filter: blur(20px)`, `background: rgba(102,126,234,0.4)`. Height `60px`. Active/hover state: `background: rgba(255,255,255,0.18)`, border-radius `8px`.

### Mobile (≤ 768px)
Bottom tab bar fixed to viewport bottom. `background: rgba(80,60,180,0.92)`, `backdrop-filter: blur(20px)`. 4 equal columns. Safe area inset for notched devices (`env(safe-area-inset-bottom)`). Active item: `color: white`; inactive: `rgba(255,255,255,0.65)`.

## Responsive Breakpoints

| Breakpoint | Change |
|---|---|
| ≤ 768px | Top nav hidden → bottom nav shown; grids collapse to 1 column; timeline becomes left-aligned single column |
| ≤ 480px | Hero `h1` shrinks to `1.7rem` |

---
_This identity must be preserved verbatim when migrating from the HTML prototype to Next.js. Every token, radius, shadow, and animation belongs to the design system._
