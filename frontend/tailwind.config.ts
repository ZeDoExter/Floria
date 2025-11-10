import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

// Brand colors inspired by Figma design
const palette = {
  // Soft pink background (matches Figma)
  blush: '#F5D7DB',
  // Cream/beige for cards
  cream: '#FFF9F0',
  // Pistachio green for primary actions
  pistachio: '#B5D99C',
  // Darker text
  charcoal: '#2D2D2D',
  // Muted text
  gray: '#6B6B6B',
  // Light borders
  lightBorder: '#E8E8E8',
  // Status colors
  success: '#7BC96F',
  error: '#E78B8B',
  warning: '#F4C47F'
}

// Optional: generate a few tints/shades (simple algorithm)
function tint(hex: string, p: number) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  const mix = (c: number) => Math.round(c + (255 - c) * p)
  return `#${[mix(r),mix(g),mix(b)].map(x => x.toString(16).padStart(2,'0')).join('')}`
}

function shade(hex: string, p: number) {
  const r = parseInt(hex.slice(1,3),16)
  const g = parseInt(hex.slice(3,5),16)
  const b = parseInt(hex.slice(5,7),16)
  const mix = (c: number) => Math.round(c * (1 - p))
  return `#${[mix(r),mix(g),mix(b)].map(x => x.toString(16).padStart(2,'0')).join('')}`
}

const semantic = {
  // Page background - soft pink
  background: palette.blush,
  foreground: palette.charcoal,
  
  // Primary (green button/accent)
  primary: palette.pistachio,
  primaryForeground: '#2D4A1F',
  
  // Card backgrounds
  card: palette.cream,
  cardForeground: palette.charcoal,
  
  // Secondary elements
  secondary: '#8FB578',
  secondaryForeground: palette.cream,
  
  // Accent (highlights)
  accent: palette.warning,
  accentForeground: '#5A3A1A',
  
  // Muted/subtle elements
  muted: '#F5E8D8',
  mutedForeground: palette.gray,
  
  // Borders
  border: palette.lightBorder,
  
  // Status colors
  success: palette.success,
  error: palette.error,
  destructive: palette.error,
  destructiveForeground: '#FFFFFF'
}

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  // For Tailwind v4 the dark mode strategy expects tuple ["class", selector]
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      colors: {
        // expose raw palette
        blush: palette.blush,
        cream: palette.cream,
        pistachio: palette.pistachio,
        charcoal: palette.charcoal,
        lightBorder: palette.lightBorder,
        success: palette.success,
        error: palette.error,
        warning: palette.warning,
        // semantic tokens (used via bg-primary etc.)
        // Map to new CSS vars to avoid potential collisions
        background: 'var(--surface)',
        foreground: 'var(--text)',
        // explicit aliases for clarity in classnames
        surface: 'var(--surface)',
        text: 'var(--text)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        border: 'var(--border)',
        destructive: 'var(--destructive)',
        'destructive-foreground': 'var(--destructive-foreground)'
      }
    }
  },
  plugins: [
    plugin(function({ addBase }) {
      addBase({
        ':root': {
          // Keep original names for backward compatibility
          '--background': semantic.background,
          '--foreground': semantic.foreground,
          // New preferred names used by Tailwind color mapping
          '--surface': semantic.background,
          '--text': semantic.foreground,
          '--card': semantic.card,
          '--card-foreground': semantic.cardForeground,
          '--primary': semantic.primary,
          '--primary-foreground': semantic.primaryForeground,
          '--secondary': semantic.secondary,
          '--secondary-foreground': semantic.secondaryForeground,
          '--accent': semantic.accent,
          '--accent-foreground': semantic.accentForeground,
          '--muted': semantic.muted,
          '--muted-foreground': semantic.mutedForeground,
          '--border': semantic.border,
          '--success': semantic.success,
          '--error': semantic.error,
          '--destructive': semantic.destructive,
          '--destructive-foreground': semantic.destructiveForeground
        },
        '.dark': {
          '--background': '#1a1f17',
          '--foreground': '#f5f5f5',
          '--surface': '#1a1f17',
          '--text': '#f5f5f5',
          '--card': '#2D2D2D',
          '--card-foreground': '#f5f5f5',
          '--primary': shade(palette.pistachio,0.35),
          '--primary-foreground': '#F7EFDA',
          '--secondary': shade(palette.charcoal,0.35),
          '--secondary-foreground': '#F7EFDA',
          '--accent': shade(palette.pistachio,0.4),
          '--accent-foreground': '#F7EFDA',
          '--muted': '#2a3229',
          '--muted-foreground': '#d1d7cc',
          '--border': '#2e352c',
          '--success': shade(palette.success, 0.2),
          '--error': shade(palette.error, 0.2),
          '--destructive': shade(palette.error, 0.2),
          '--destructive-foreground': '#FFFFFF'
        }
      })
    })
  ]
}
export default config
