# AYUSH-Care Design System & Screen Blueprint Specification (GIGW Compliant)

This document is the **authoritative master guide for UI/UX designers and frontend developers** working on **AYUSH-Care (MediKiosk)**. It defines all visual tokens, government compliance standards, and the **4 core screen archetype wireframes** used across all 18 patient and physician screens.

---

## 1. Core Visual Foundations & Rules

1. **Government Utilitarian Standard:** Follows the **Guidelines for Indian Government Websites (GIGW)** and **NIC conventions** — dense, structured, information-first.
2. **100% Flat Elevation (Zero Shadows):** No floating drop shadows or blurred cards. All panels sit flat on the `#EAEDF0` canvas with clean 1px borders (`#CED4DA`).
3. **Sharp 2px Square Corners:** All buttons, cards, input fields, badges, and tabs use `rounded-[2px]`. No rounded pills or circular cards.
4. **Authoritative National Identity:** Official placement of the **Ashoka Lion Capital (National Emblem with सत्यमेव जयते)** top-left and the **Indian National Tricolor Accent Ribbon (`#FF9933` - `#FFFFFF` - `#138808`)** directly under the header.
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

* **English Font:** `"Open Sans", Arial, Helvetica, sans-serif`
* **Hindi Font:** `"Noto Sans Devanagari", sans-serif`
* **Tailwind Config:** `fontFamily: { sans: ['"Open Sans"', '"Noto Sans Devanagari"', 'Arial', 'sans-serif'] }`

### Hierarchy Scale:
* **Kiosk Main Title:** `text-2xl sm:text-4xl md:text-5xl font-extrabold` (Color: `rgb(10, 45, 101)`)
* **Section Heading:** `text-sm sm:text-base font-extrabold uppercase tracking-wider`
* **Body / Question Text:** `text-base sm:text-lg font-semibold` (Color: `#212529` / `#495057`)
* **Option Button Text:** `text-sm sm:text-base font-bold`
* **Sub-badge / Metadata:** `text-[11px] sm:text-xs font-bold uppercase tracking-wider`

---

## 4. The 4 Standard Screen Layout Archetypes (Wireframe Blueprints)

To build any of the 18 screens in the system, use one of these 4 standardized templates:

---

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

* **Key Guidelines:**
  * Clean white central container (`max-w-2xl bg-white border border-[#CED4DA] p-6`).
  * Inputs must have minimum **52px height** and clear numeric keypad support for touchscreens.
  * For **Consent Screen (S-04)**: Display 2 side-by-side action buttons: **`सहमत हैं • I AGREE`** (Navy `#0A2D65`) and **`असहमत • DECLINE`** (Flat Red Outline `#B91C1C`).

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

* **Key Guidelines:**
  * The **Mic Button** is a prominent 72px square/circle with pulse animation while recording.
  * Patients can always tap suggested chips if they don't want to speak.
  * Emergency Red-Flag banner locks navigation and displays immediate priority triage notice.

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

* **Key Guidelines:**
  * Exactly **1 Question per screen** to avoid cognitive overload for elderly patients.
  * Options: **3 Large Horizontal Option Cards** (60px height).
  * State: White background by default $\rightarrow$ solid `rgb(10, 45, 101)` with white text when selected.
  * Classical tags (*Vata, Pitta, Kapha*) are calculated mathematically in the background and are never shown as medical jargon to the patient.

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

* **Key Guidelines:**
  * Dense 2-column or 3-column information grid.
  * Tridosha Prakriti breakdown displayed via exact deterministic percentage bars.
  * Instant 1-click action bar for physician approval.

---

## 5. UI Component Specs Reference for Developers

### A. KioskButton (Primary CTA)
```tsx
<button
  className="w-full py-3.5 px-6 text-base sm:text-xl font-black rounded-[2px] border border-[#071F45] text-white flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
  style={{ backgroundColor: 'rgb(10, 45, 101)', color: 'rgb(255, 255, 255)' }}
>
  <span>पंजीकरण आरंभ करें • TAP TO BEGIN</span>
  <ArrowRight className="w-5 h-5 text-white" />
</button>
```

### B. Option / MCQ Selection Button
```tsx
<button
  className="w-full p-4 rounded-[2px] border border-[#CED4DA] text-left transition-colors font-bold text-sm sm:text-base cursor-pointer"
  style={{
    backgroundColor: isSelected ? 'rgb(10, 45, 101)' : 'rgb(255, 255, 255)',
    color: isSelected ? 'rgb(255, 255, 255)' : '#212529',
    borderColor: isSelected ? '#071F45' : '#CED4DA',
  }}
>
  {optionText}
</button>
```

---

## 6. Verification & Accessibility Checklist

- [x] **WCAG AAA Contrast Ratio (10.04:1)** on primary navy / white buttons.
- [x] **GIGW (Guidelines for Indian Government Websites)** flat styling rules strictly observed.
- [x] **Ashoka Lion Capital** state emblem with *"सत्यमेव जयते"* positioned top-left.
- [x] **Indian National Tricolor** accent ribbon integrated across all page headers.
- [x] **DPDP Act 2023** privacy and ephemeral session data notice displayed.
- [x] **Dual-Mode Access:** Complete touch usability + sequential bilingual voice readout.
- [x] **Zero Disorientation:** 100% flat, instantaneous UI state transitions with zero floating shadows.
