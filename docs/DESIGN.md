# AYUSH-Care Design System Specification (GIGW Compliant)

This document specifies the authoritative visual design system for **AYUSH-Care (MediKiosk)**. It is specifically engineered to adhere strictly to the **Guidelines for Indian Government Websites (GIGW)** and **National Informatics Centre (NIC)** conventions, combined with high-accessibility principles for elderly and rural hospital kiosk users.

---

## 1. Core Design Philosophy: "Government Utilitarian & Accessible"

1. **Information-First, Utilitarian Layout:** Utilitarian portal layout over marketing SaaS landing pages. Dense, information-packed structure with minimal unnecessary whitespace.
2. **100% Flat Elevation (Zero Shadows):** No floating drop shadows, no bloated cards. All panels sit flat on the government canvas with crisp 1px borders.
3. **Sharp 2px Square Corners:** No rounded pill buttons or curved cards. Sharp or barely-rounded (`2px` max) corners across all buttons, inputs, tabs, and cards.
4. **Authoritative National Identity:** Official placement of the **Ashoka Lion Capital (National Emblem with सत्यमेव जयते)** and the **Indian National Tricolor Accent Ribbon (`#FF9933` - `#FFFFFF` - `#138808`)**.
5. **Touch & Audio Accessibility (Dual-Mode):** Every action is achievable via high-contrast touch targets (minimum 48px–64px height) and assisted by sequential bilingual Text-to-Speech (Hindi first $\rightarrow$ English second).

---

## 2. Color Palette & WCAG AAA Contrast Tokens

| Token Name | Hex Code / RGB | Role & Usage | Contrast Ratio |
|---|---|---|---|
| **`ayush-navy`** (Primary) | `#0A2D65` / `rgb(10, 45, 101)` | Primary header, primary buttons, major titles, active badges | **10.04 : 1** (WCAG AAA) against white |
| **`ayush-navy-dark`** | `#071F45` / `rgb(7, 31, 69)` | Button hover states, active borders | **13.5 : 1** (WCAG AAA) |
| **`ayush-navy-light`** | `#E8EDF5` | Subtle category badge fill, active step backgrounds | Background tint |
| **`ayush-blue`** (Action) | `#0066CC` | Underlines, secondary action accents, icon highlights | **4.8 : 1** (WCAG AA) |
| **`ayush-canvas`** | `#EAEDF0` | Base portal background canvas (reduces kiosk screen glare) | Canvas |
| **`ayush-surface`** | `#FFFFFF` / `rgb(255, 255, 255)` | Card backgrounds, button text, modal surface | Surface |
| **`ayush-border`** | `#CED4DA` | Standard 1px flat border for all boxes, inputs, and cards | Boundary |
| **`ayush-text-dark`** | `#212529` | Primary readable body text, headings | **14.2 : 1** (WCAG AAA) |
| **`ayush-text-muted`** | `#495057` | Subtitles, step descriptions, table metadata | **7.1 : 1** (WCAG AAA) |
| **`status-success`** | `#15803D` / `#F0FDF4` | Confirmation badges, completed steps | **5.2 : 1** |
| **`status-danger`** | `#B91C1C` / `#FEF2F2` | Emergency Red-Flag triage alerts, decline actions | **5.8 : 1** |
| **`tricolor-saffron`** | `#FF9933` | National Tricolor top accent stripe | Identity |
| **`tricolor-green`** | `#138808` | National Tricolor top accent stripe | Identity |

---

## 3. Typography & Font Family Stack

* **English Font:** `"Open Sans", Arial, Helvetica, sans-serif`
* **Hindi Font:** `"Noto Sans Devanagari", sans-serif`
* **Tailwind Definition:** `fontFamily: { sans: ['"Open Sans"', '"Noto Sans Devanagari"', 'Arial', 'sans-serif'] }`

### Type Scale (Dense & Readable)
- **Portal Main Title:** `text-2xl sm:text-4xl md:text-5xl font-extrabold` (`rgb(10, 45, 101)`)
- **Section Heading:** `text-sm sm:text-base font-extrabold uppercase tracking-wider`
- **Body / Question Text:** `text-base sm:text-lg font-semibold` (`#212529` / `#495057`)
- **Step / Option Text:** `text-xs sm:text-sm font-medium`
- **Sub-badge / Metadata:** `text-[11px] sm:text-xs font-bold uppercase tracking-wider`

---

## 4. Layout, Spacing & Box Conventions

1. **Tight Vertical Spacing:** Margins and padding are compressed (`py-3 sm:py-5`, `gap-2.5 sm:gap-3`) so all primary content and the primary CTA button sit comfortably within view above the fold on all standard 1080p kiosk screens, tablets, and laptops without excessive vertical scrolling.
2. **Flat Step Boxes (No Grey Fills):** Information and step containers use a plain white background (`bg-white`) with a thin 1px border (`border-[#CED4DA]`) rather than filled grey inner panels.
3. **Square Indicator Badges:** Step numbers and checkmark boxes use a sharp 2px square box (`w-8 h-8 rounded-[2px]`) with solid navy background (`rgb(10, 45, 101)`) and pure white text.

---

## 5. UI Component Specifications

### A. KioskButton (Primary CTA)
* **Classes:** `w-full py-3.5 px-6 text-base sm:text-xl font-black rounded-[2px] border border-[#071F45] text-white flex items-center justify-center gap-2 cursor-pointer`
* **Style:** `backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)'`
* **Behavior:** Tactile click feedback with `active:scale-[0.99]`, zero box-shadow.

### B. Language Selection Card
* **Default State:** Plain white surface (`bg-white`), 1px border (`border-[#CED4DA]`), title in `rgb(10, 45, 101)`, squared-off checkmark box.
* **Hover / Selected State:** Smoothly transforms into solid `rgb(10, 45, 101)` background, pure white text `rgb(255, 255, 255)`, and solid `#071F45` border.

### C. Voice Synthesis Bar (AudioSpeaker)
* **Design:** Compact inline panel with `🔊 आवाज़ में सुनें (Listen Aloud)` & `↺ दोबारा (Repeat)`.
* **Cadence:** Speaks **Hindi audio FIRST**, and immediately transitions to **English audio SECOND** sequentially.

### D. Hospital Header (KioskHeader)
* **Top Stripe:** 4px Tricolor Ribbon (`#FF9933` | `#FFFFFF` | `#138808`).
* **Branding:** Ashoka Lion Capital Emblem + *"भारत सरकार / Government of India"* + *"आयुष मंत्रालय / Ministry of Ayush"* + *"अखिल भारतीय आयुर्वेद संस्थान (AIIA), नई दिल्ली"*.
* **Action Tools:** Minimal inline **`अ/A Switch to English`** link + Helpline **`1800-11-2233`**.

---

## 6. Accessibility & Compliance Checklist

- [x] **WCAG AAA Contrast (10.04:1)** on all primary navy/white elements.
- [x] **GIGW (Guidelines for Indian Government Websites)** flat styling rules observed.
- [x] **Ashoka Lion Capital** state emblem with *"सत्यमेव जयते"* positioned top-left.
- [x] **Indian National Tricolor** accent ribbon integrated across the portal header.
- [x] **DPDP Act 2023** privacy and ephemeral patient health session notice displayed.
- [x] **Dual-Mode Access:** Complete touch usability + sequential bilingual voice readout.
- [x] **Zero Motion Sickness:** Fast, instantaneous UI state changes with zero disorienting 3D animations.
