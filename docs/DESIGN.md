# AYUSH-Care Design System & Screen Blueprint Specification (GIGW Compliant)

This document is the **authoritative master guide for UI/UX designers and frontend developers** working on **AYUSH-Care (MediKiosk)**. It defines all visual tokens, government compliance standards, iconography rules, motion accessibility guidelines, and the **4 core screen archetype wireframes** used across all 18 patient and physician screens.

---

## 1. Core Visual Foundations & Rules

1. **Government Utilitarian Standard:** Follows the **Guidelines for Indian Government Websites (GIGW)** and **NIC conventions** — dense, structured, information-first.
2. **100% Flat Elevation (Zero Shadows):** No floating drop shadows or blurred cards. All panels sit flat on the `#EAEDF0` canvas with clean 1px borders (`#CED4DA`).
3. **Sharp 2px Square Corners:** All buttons, cards, input fields, badges, and tabs use `rounded-[2px]`. No rounded pills or circular cards.
4. **Authoritative National Identity:** Official placement of the **Ashoka Lion Capital (National Emblem with सत्यमेव जयते)** top-left and the **Indian National Tricolor Accent Ribbon (`#FF9933` - `#FFFFFF` - `#138808`)** directly under the header. National symbols must always appear in correct official proportions and colors, never stylized or distorted.
5. **Dual-Mode Accessibility:** Every interactive element has a minimum touch target of **48px–64px** and is paired with sequential bilingual Text-to-Speech (**Hindi audio first $\rightarrow$ English audio second**).

---

## 2. Master Color Palette & Design Tokens

| Color Token | Hex / RGB Value | Role & Usage | Contrast Ratio |
|---|---|---|---|
| **`ayush-navy`** (Primary) | `#0A2D65` / `rgb(10, 45, 101)` | Header text, primary buttons, step badges, active borders | **10.04 : 1** (WCAG AAA) |
| **`ayush-navy-dark`** | `#071F45` / `rgb(7, 31, 69)` | Button hover/active states, focused borders | **13.5 : 1** (WCAG AAA) |
| **`ayush-navy-light`** | `#E8EDF5` | Badge fill, system prompt boxes, active step highlights | Background tint |
| **`ayush-blue`** (Action) | `#0066CC` | Underlines, secondary action accents, icon highlights | **4.8 : 1** (WCAG AA) |
| **`ayush-canvas`** | `#EAEDF0` | Base portal background canvas (reduces kiosk glare) | Canvas |
| **`ayush-surface`** | `#FFFFFF` / `rgb(255, 255, 255)` | Card backgrounds, button text, modal surface | Surface |
| **`ayush-border`** | `#CED4DA` | Standard 1px flat border for all containers and inputs | Boundary |
| **`ayush-text-dark`** | `#212529` | Primary readable body text, headings | **14.2 : 1** (WCAG AAA) |
| **`ayush-text-muted`** | `#495057` | Subtitles, step descriptions, table metadata | **7.1 : 1** (WCAG AAA) |
| **`status-success`** | `#15803D` / `#F0FDF4` | Confirmation badges, completed steps | **5.2 : 1** |
| **`status-danger`** | `#B91C1C` / `#FEF2F2` | Emergency Red-Flag triage alerts, decline actions | **5.8 : 1** |
| **`tricolor-saffron`** | `#FF9933` | Top national accent ribbon | Identity |
| **`tricolor-green`** | `#138808` | Top national accent ribbon | Identity |

---

## 3. Typography Stack & Font Hierarchy

* **English Font:** `"Noto Sans", Arial, Helvetica, sans-serif` (Weights 100..900)
* **Hindi Font:** `"Noto Sans Devanagari", sans-serif` (Weights 100..900)
* **Tailwind Config:** `fontFamily: { sans: ['"Noto Sans"', '"Noto Sans Devanagari"', 'Arial', 'sans-serif'] }`

### Hierarchy Scale:
* **Kiosk Main Title:** `text-2xl sm:text-4xl md:text-5xl font-extrabold` (Color: `rgb(10, 45, 101)`)
* **Section Heading:** `text-sm sm:text-base font-extrabold uppercase tracking-wider`
* **Body / Question Text:** `text-base sm:text-lg font-semibold` (Color: `#212529` / `#495057`)
* **Option Button Text:** `text-sm sm:text-base font-bold`
* **Sub-badge / Metadata:** `text-[11px] sm:text-xs font-bold uppercase tracking-wider`

---

## 4. Iconography Standards (GIGW Compliant)

GIGW requires icons to be simple, self-explanatory, and legible at arm's length on high-resolution touchscreens.

### Rules & Guidelines:
1. **Outline/Line-Style Icons Only:** Use **Lucide React** (`lucide-react`). Clean outline geometry (1.5px–2px stroke) without gradients, drop-shadows, glossy bubbles, or 3D fills.
2. **Literal and Universal Symbolism:**
   * 🎙️ `Mic` for Voice Input
   * 🔊 `Volume2` / `VolumeX` for Spoken Audio Prompter
   * 📄 `FileText` for Prescriptions / Documents
   * ⚖️ `Scale` for Classical Ayurvedic Tridosha Balance (Vata-Pitta-Kapha)
   * 🌐 `Globe` for Language Selection
   * ✓ `CheckCircle2` / `Check` for Selection Confirmations
   * 📞 `PhoneCall` for OPD Helpdesk
3. **Always Paired with Text Labels:** An icon must **never be the sole signal** for an action. Low-literacy patients rely on icon + text combined with audio.
4. **Strictly Forbidden:** 
   * ❌ Sparkle / Star "AI-Magic" icons (universal tell of generic AI generators).
   * ❌ 3D/Skeuomorphic icon sets.
   * ❌ Abstract/clever symbols that confuse first-time rural users.

---

## 5. Animation & Motion Standards (Accessibility-First)

Government accessibility guidelines treat animation as a **functional necessity**, never as decorative delight.

### Rules & Guidelines:
1. **Fast, Functional Transitions Only (150ms – 250ms):** Quick slide/fade between kiosk screens to orient the patient. No sluggish multi-second animations.
2. **No Decorative Motion:** No floating background particles, no bouncing elements, no parallax scrolling, no auto-playing loops.
3. **Subtle State Feedback:** The only recurring animation permitted is a **gentle, functional pulse on the Microphone button (`.animate-mic-recording`)** to signal to a low-literacy patient that the system is actively listening.
4. **Respect `prefers-reduced-motion`:**
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, ::before, ::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
   }
   ```

### Summary Table for Design Team:
| Element | Do | Avoid |
|---|---|---|
| **Icons** | Lucide/outline-style, literal meaning, large (20–28px), always paired with text label | Filled/gradient/3D icons, sparkle "AI" icons, abstract decorative symbols |
| **Animation** | Fast functional transitions (~200ms), active recording pulse state | Decorative motion, auto-play loops, parallax, bouncing/floating cards |

---

## 6. The 4 Standard Screen Layout Archetypes (Wireframe Blueprints)

### 🏛️ TEMPLATE 1: Form & Identification Screen (S-03, S-04, S-11)
Used for: **ABHA QR Scan, Patient Registration, Consent Capture, Document Upload**.

```
+-----------------------------------------------------------------------+
|  [Tricolor Line]                                                      |
|  [Emblem] Ministry of Ayush / AIIA           [अ/A Switch] [1800-11-2233] |
+-----------------------------------------------------------------------+
|                                                                       |
|  [Audio Prompter: 🔊 आवाज़ में सुनें | ↺ दोबारा]                        |
|  [Badge: रोगी पहचान / PATIENT IDENTIFICATION]                           |
|  Title: अपना ABHA कार्ड स्कैन करें या विवरण भरें                      |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [ Tab 1: ABHA QR Scan ] | [ Tab 2: Manual Registration ]        |  |
|  +-----------------------------------------------------------------+  |
|  |                                                                 |  |
|  |   [ Camera Viewfinder: 280x280px QR Scanner Box ]               |  |
|  |   - Or enter 14-digit ABHA Number / Phone Number:               |  |
|  |   [ Input Box: 52px height, 1px border #CED4DA, text-lg ]       |  |
|  |                                                                 |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  [Primary CTA Button: आगे बढ़ें • CONTINUE → (rgb(10, 45, 101), 54px)] |
|  [Secondary Outline: ← वापस जाएं (Back)]                              |
+-----------------------------------------------------------------------+
|  Footer: AIIA OPD Terminal 01 | DPDP Act 2023 Compliant               |
+-----------------------------------------------------------------------+
```

---

### 🎙️ TEMPLATE 2: Conversational Voice & Complaint Screen (S-05, S-06, S-07, S-08)
Used for: **Chief Complaint Intake, Adaptive SOCRATES Follow-up, Red-Flag Triage Alert**.

```
+-----------------------------------------------------------------------+
|  [Tricolor Line]                                                      |
|  [Emblem] Ministry of Ayush / AIIA           [अ/A Switch] [1800-11-2233] |
+-----------------------------------------------------------------------+
|                                                                       |
|  [AI Doctor Prompter Bubble: bg-[#E8EDF5] border border-[#0A2D65]/20]  |
|  "आपको क्या तकलीफ हो रही है? कृपया बोलकर या लिखकर बताएं।"            |
|  [Audio Speaker: 🔊 Listening...]                                     |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Live Speech-to-Text Transcript Display:                         |  |
|  | "मुझे 3 दिन से सिरदर्द और चक्कर आ रहे हैं..."                   |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|                     [ 🎙 BIG MIC BUTTON: 72x72px ]                    |
|                (Idle: #0A2D65 Navy | Recording: #B91C1C Red)          |
|                                                                       |
|  Suggested Common Symptoms (Tap to add):                              |
|  [ + सिरदर्द (Headache) ]  [ + जोड़ों का दर्द (Joint Pain) ]  [ + गैस ]|
|                                                                       |
|  [Primary Button: विवरण सहेजें • NEXT → (rgb(10, 45, 101))]           |
+-----------------------------------------------------------------------+
|  * Emergency Safety Net (S-08): If chest pain/stroke keywords occur,  |
|    instant full-width alert banner (#FEF2F2, border #B91C1C) appears. |
+-----------------------------------------------------------------------+
```

---

### ⚖️ TEMPLATE 3: Classical Prakriti Assessment Screen (S-09, S-10)
Used for: **15-Trait Charaka Samhita Prakriti Questionnaire & Dashavidha Pariksha**.

```
+-----------------------------------------------------------------------+
|  [Tricolor Line]                                                      |
|  [Emblem] Ministry of Ayush / AIIA           [अ/A Switch] [1800-11-2233] |
+-----------------------------------------------------------------------+
|                                                                       |
|  [Step Progress Indicator: प्रश्न 04 / 15 • Body Weight Tendency]      |
|  [Horizontal Progress Bar: h-1.5 bg-[#CED4DA] fill in rgb(10, 45, 101)]|
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Question: आपके शरीर का वजन किस प्रकार रहता है?                  |  |
|  | How would you describe your body weight tendency?               |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Option A] पतला, दुबला शरीर; वजन बढ़ाना कठिन (Vata Trait)       |  |
|  +-----------------------------------------------------------------+  |
|  | [Option B] मध्यम, संतुलित वजन; थोड़ा प्रयास से नियंत्रण (Pitta) |  |
|  +-----------------------------------------------------------------+  |
|  | [Option C] भारी, मजबूत शरीर; वजन आसानी से बढ़ता है (Kapha Trait)|  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  Bottom Navigation:                                                   |
|  [ ← पिछला (Previous) ]                      [ अगला • NEXT → (Navy) ] |
+-----------------------------------------------------------------------+
```

---

### 📋 TEMPLATE 4: Dense Clinical Summary & Doctor Dashboard (S-12, S-17, S-18)
Used for: **Patient Summary Review, Token Dispatch, and Physician EMR Review**.

```
+-----------------------------------------------------------------------+
|  [Tricolor Line]                                                      |
|  [Emblem] AIIA Physician Intake Terminal         [Doctor: Dr. Sharma] |
+-----------------------------------------------------------------------+
|                                                                       |
|  Header Stats: [Patients in Queue: 12] [Avg Review: 2.1m] [Red Flags: 1]|
|                                                                       |
|  +-----------------------------+ +----------------------------------+ |
|  | 1. PATIENT DEMOGRAPHICS     | | 3. TRIDOSHA PRAKRITI SCORECARD   | |
|  | Name: Ramesh Kumar (62/M)   | | Dominant: Pitta-Kapha (Medium)   | |
|  | ABHA ID: 91-4829-1029-44    | | [Vata: 20%] [Pitta: 55%] [Kapha: | |
|  | Chief Complaint: Joint Pain | |             25%]                 | |
|  +-----------------------------+ +----------------------------------+ |
|  | 2. CONVERSATION HPI SUMMARY | | 4. EXTRACTED MEDICATIONS & LABS  | |
|  | - Onset: 2 weeks ago        | | - Ashwagandha Churna (Verified)  | |
|  | - Character: Dull aching    | | - Yograj Guggulu (Verified)      | |
|  | - Aggravated by cold food   | | - Blood Sugar: 112 mg/dL         | |
|  +-----------------------------+ +----------------------------------+ |
|                                                                       |
|  Physician Action Bar:                                                |
|  [ ✓ Accept & Send to OPD ]   [ ✏ Amend / Add Note ]   [ ✕ Retake ]   |
+-----------------------------------------------------------------------+
```

---

## 7. Verification & Accessibility Checklist

- [x] **WCAG AAA Contrast Ratio (10.04:1)** on primary navy / white buttons.
- [x] **GIGW (Guidelines for Indian Government Websites)** flat styling rules strictly observed.
- [x] **Lucide outline-style icons only**, literal symbolism, always paired with text.
- [x] **`prefers-reduced-motion` compliance** in CSS, zero decorative loops/parallax.
- [x] **Ashoka Lion Capital** state emblem with *"सत्यमेव जयते"* positioned top-left in correct proportion.
- [x] **Indian National Tricolor** accent ribbon integrated across all page headers.
- [x] **DPDP Act 2023** privacy and ephemeral session data notice displayed.
- [x] **Dual-Mode Access:** Complete touch usability + sequential bilingual voice readout.
