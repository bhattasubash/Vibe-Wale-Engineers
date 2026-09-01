# Visual Design System: AYUSH-Care

This document outlines the complete design system for the AYUSH-Care application. It is explicitly engineered for elderly, low-literacy, hospital-kiosk users with accessibility as a core constraint.

## 1. Design Principles
1. **Touch-first, always** — Every interaction must be completable by tap alone. Voice is an enhancement, not a requirement.
2. **Readable at arm's length** — Body text minimum 18px, headings 24px+. Users may be standing, leaning, or have poor vision.
3. **One action per screen** — Each kiosk screen asks one question or performs one task. No multi-step forms.
4. **Consistent escape hatches** — Every screen has Back, Repeat, and Help buttons in the same position.
5. **Calm, clinical, trustworthy** — Not flashy. Patients are anxious. Use calming colors and professional tone.

## 2. Color Palette
- **Primary:** Deep Teal (`#0D6E6E`) — Trustworthy, clinical, calming. Used for primary buttons, active states, headers.
- **Primary Light:** (`#E0F2F1`) — Backgrounds, subtle highlights.
- **Secondary:** Warm Amber (`#F59E0B`) — Attention, progress indicators, dosha highlights.
- **Background:** Off-white (`#FAFBFC`) — Kiosk screens. NOT pure white (reduces glare).
- **Surface:** White (`#FFFFFF`) — Cards, modals.
- **Text Primary:** Near-black (`#1A1A2E`) — Body text. WCAG AAA contrast ratio against background.
- **Text Secondary:** (`#6B7280`) — Labels, hints.
- **Success:** (`#059669`) — Confirmations, completed steps.
- **Warning:** (`#D97706`) — Caution states.
- **Danger/Red-flag:** (`#DC2626`) — Red flag alerts, critical actions.
- **Danger Background:** (`#FEF2F2`) — Red flag alert background.

All color combinations pass WCAG AA (4.5:1 for text, 3:1 for large text/UI).

## 3. Typography
- **Font family:** `Inter` for English, `Noto Sans Devanagari` for Hindi.
- **Scale:**
  - **Kiosk heading:** `text-3xl` (30px) `font-bold` — screen titles
  - **Kiosk body:** `text-xl` (20px) `font-medium` — questions, instructions
  - **Kiosk option:** `text-lg` (18px) `font-medium` — answer buttons
  - **Kiosk hint:** `text-base` (16px) `font-normal` — secondary info
  - **Physician heading:** `text-xl` (20px) `font-semibold`
  - **Physician body:** `text-sm` (14px) `font-normal` — dense clinical display
  - **Physician label:** `text-xs` (12px) `font-medium uppercase tracking-wide`

## 4. Spacing & Layout
- **Kiosk screens:** `max-w-2xl mx-auto`, centered content, generous padding (`p-8` minimum).
- **Touch targets:** Minimum 48x48px (WCAG), recommended 64px for primary kiosk buttons.
- **Button spacing:** `gap-4` minimum between tap targets to prevent mis-taps.
- **Kiosk target viewport:** Landscape 1280x800 minimum, responsive down to 1024x768.
- **Physician dashboard:** `max-w-7xl`, dense grid layout.

## 5. Component Specifications (Tailwind Classes)
- **KioskButton (Primary):**
  `w-full py-5 px-8 text-xl font-semibold rounded-2xl bg-primary text-white hover:opacity-95 active:scale-[0.98] transition-all shadow-md`
- **KioskButton (Secondary/Option):**
  `w-full py-4 px-6 text-lg font-medium rounded-xl border-2 border-primary-light bg-surface text-text-primary hover:border-primary hover:bg-primary-light active:bg-primary-light/80 transition-all`
- **KioskButton (Danger):**
  `w-full py-5 px-8 text-xl font-semibold rounded-2xl bg-status-danger text-white hover:opacity-95 active:scale-[0.98]`
- **KioskCard:**
  `bg-surface rounded-3xl shadow-lg p-8 border border-gray-100`
- **MicButton:**
  `w-20 h-20 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:opacity-95 active:scale-95 transition-all`
- **ProgressBar:**
  Container: `h-2 bg-primary-light rounded-full`, Fill: `h-2 bg-primary rounded-full transition-all duration-500`
- **RedFlagBanner:**
  `bg-status-dangerBg border-l-4 border-status-danger p-6 rounded-r-xl text-status-danger`
- **PhysicianCard:**
  `bg-surface rounded-lg shadow-sm p-4 border border-gray-200`
- **NavBar (Kiosk):**
  `fixed bottom-0 w-full bg-surface border-t border-gray-200 px-6 py-4 flex justify-between items-center`

## 6. Iconography
- **Library:** Lucide React (`lucide-react`)
- **Minimum icon size on kiosk:** 28px (`w-7 h-7`)
- **Key icons:** Mic, MicOff, ArrowLeft, ArrowRight, Check, X, AlertTriangle, Upload, Camera, FileText, Heart, User, Shield, Globe
- **Rule:** Icons are *always* paired with text labels on the kiosk (never icon-only for critical actions).

## 7. Animation & Motion
- **Interactive elements:** `transition-all duration-200`
- **Page transitions:** Simple fade-in (`animate-in fade-in duration-300`)
- **Loading states:** Skeleton shimmer for content, spinner for API calls.
- **Mic recording:** Pulsing ring animation (`animate-pulse`) on mic button.
- **Red flag alert:** Subtle pulse on the border (`animate-pulse`).
- **Constraint:** NO heavy animations on kiosk to avoid motion sensitivity issues and support low-spec hardware.

## 8. Accessibility Checklist
- [ ] Visible focus rings on all interactive elements (`ring-2 ring-teal-500 ring-offset-2`).
- [ ] `aria-label` on all icon buttons.
- [ ] `aria-live='polite'` on dynamic content areas (chat messages, TTS status).
- [ ] `role='alert'` on red-flag banners.
- [ ] `prefers-reduced-motion` respected.
- [ ] Color is never the only indicator (always paired with icon + text).
- [ ] Tab order follows visual flow.
- [ ] Screen reader announcements for step transitions.

## 9. Responsive Breakpoints
- **Kiosk mode (default):** `>= 1024px` — Optimized landscape layout.
- **Tablet:** `768px-1023px` — Stacked layout, same touch targets.
- **Demo/Laptop:** `1280px+` — Judge-friendly browser view.
- **Physician dashboard:** `>= 1280px` recommended, functional at `1024px`.

## 10. Dark Mode
NOT in MVP. Kiosk screens are high-brightness environments. Physician dashboard could add dark mode post-hackathon.

---

## 11. Tailwind Configuration Snippet

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D6E6E', // Deep Teal
          light: '#E0F2F1',
        },
        secondary: {
          DEFAULT: '#F59E0B', // Warm Amber
        },
        background: '#FAFBFC', // Off-white
        surface: '#FFFFFF',
        text: {
          primary: '#1A1A2E',
          secondary: '#6B7280',
        },
        status: {
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626',
          dangerBg: '#FEF2F2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      spacing: {
        'touch-min': '48px',
        'touch-ideal': '64px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
export default config;
```
