---
name: Dongmodel
description: A personal collection ledger for Thai collectors — every modong recorded, every wanted item tracked.
colors:
  armor-ground: "#F3F5FB"
  black-joint: "#1A1A1A"
  blue-chest: "#2C52B3"
  red-feet: "#FB2F38"
  yellow-vent: "#FFF867"
  gray-frame: "#5A5B6D"
  dark-gray-weapons: "#3A3D46"
  white-armor: "#FFFFFF"
  surface-low: "#DCDDE9"
  border-line: "#CCCFD8"
typography:
  display:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.3
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.5
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.blue-chest}"
    textColor: "{colors.white-armor}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "#2246A0"
    textColor: "{colors.white-armor}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.black-joint}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-ghost-active:
    backgroundColor: "{colors.dark-gray-weapons}"
    textColor: "{colors.white-armor}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.white-armor}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.white-armor}"
    textColor: "{colors.black-joint}"
    rounded: "{rounded.sm}"
    height: "44px"
  state-badge:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.black-joint}"
    rounded: "4px"
    padding: "2px 6px"
---

# Design System: Dongmodel

## 1. Overview

**Creative North Star: "The Personal Archive"**

Dongmodel is a personal ledger kept by someone who knows their stuff. It does not perform. It does not solicit engagement. It is the place where a Thai collector maintains a precise, private record — what they have, what they are hunting, what they paid, what they let go. Every element exists to serve that act of recording; nothing exists to impress an outside observer.

The visual system is quiet and functional. White armor card surfaces on a blue-tinted near-white ground. Type that earns its hierarchy through weight alone — no size theatrics. A deep blue primary that shows up exactly where action is required and nowhere else. The red accent signals focus and secondary actions without competing for attention. There is very little motion; state changes are quick and informational, not choreographed.

This system explicitly rejects three temptations: the social media feed (algorithmic, engagement-oriented, public-by-default), the marketplace (price-forward, grid-heavy, shopping-coded), and the generic productivity dashboard (copy-paste corporate palette, "streamline your workflow" voice, engagement-oriented chrome). The interface belongs to the collector, not to the platform.

**Key Characteristics:**
- Near-flat elevation — one shadow weight, used consistently
- Weight-only type hierarchy — system-ui at 900/600, no size clamp theatrics
- Blue Chest and Red Feet as the only chromatic voices — not for decoration
- Dense information where the collector needs it — no padding inflation for "breathing room"
- Thai-first copy and English chrome coexist without visual conflict
- Private by default: nothing about the layout implies the content is meant to be seen by others

## 2. Colors: The White Armor Palette

The palette is restrained: a blue-tinted near-white ground, a deep black ink, one primary action color, one secondary action color, neutral surface layers, and reserved highlight and structural tones. No color is decorative.

### Primary
- **Blue Chest** (`#2C52B3`): The single chromatic voice for primary actions and the one place the UI says "this matters." Used on primary buttons, active status indicators, and focus rings. Its rarity is the point. Contrast against White Armor: 7.2:1 (AAA).

### Secondary
- **Red Feet** (`#FB2F38`): Error states, danger actions, and the Wanted Items workflow accent. Contrasts with Blue Chest without competing — they never appear together as equal-weight calls to action.

### Neutral
- **Armor Ground** (`#F3F5FB`): The page background. Tinted toward Blue Chest (hsl 222°) so the primary color defines the ground rather than a generic neutral.
- **Black Joint** (`#1A1A1A`): Body text, active nav states, primary labels. Pure near-black.
- **White Armor** (`#FFFFFF`): All card and panel surfaces. Cards float on Armor Ground; the white/ground contrast is the primary depth signal.
- **Surface Low** (`#DCDDE9`): Icon background chips and muted surface layers (state rows, inactive badges). Tinted toward Blue Chest hue.
- **Gray Frame** (`#5A5B6D`): Secondary text, metadata, placeholder copy, muted-foreground labels. Contrast against White Armor: 6.7:1 (AAA).
- **Dark Gray Weapons** (`#3A3D46`): Ghost button active fill, hover surface overlays. Darker than Gray Frame, lighter than Black Joint.
- **Yellow Vent** (`#FFF867`): Warning badge backgrounds only — never used as text color or on white surfaces (insufficient contrast). Pair with Black Joint text.
- **Border Line** (`#CCCFD8`): Card borders, input outlines at rest, dividers. Tinted toward Blue Chest hue.

### Named Rules
**The One Primary Rule.** Blue Chest appears on ≤2 elements per screen at any one time. It is reserved for the single most important action. Using it decoratively — side accents, icon colors, section dividers — dilutes its meaning and is prohibited.

**The Armor Ground Rule.** Background is `#F3F5FB` (hsl 222° 25% 97%) — tinted toward Blue Chest, not toward a generic cool or warm neutral. The rule stands: if lightness or saturation is ever revisited, always tint toward hue 222° (Blue Chest's direction). The armor personality is carried by Blue Chest, not by the page ground alone.

## 3. Typography

**Body / UI Font:** system-ui, -apple-system, BlinkMacSystemFont, sans-serif (SF Pro on Apple, Segoe UI on Windows, the best native sans at any given OS)

**Character:** A single system sans that relies entirely on weight contrast for hierarchy. No display typeface. No editorial pairing. The type is the collector's tool, not the collector's aesthetic statement. 900-weight (font-black) for all headings; 600 for body labels; no intermediate 700 for UI chrome.

### Hierarchy
- **Display** (900, 2.25rem / 36px, leading 1.1, tracking −0.01em): Dashboard section headings. The largest typographic moment on any screen. Thai and English both sit here.
- **Headline** (900, 1.875rem / 30px, leading 1.2, tracking −0.01em): Page-level titles used in smaller contexts (card overview h2).
- **Title** (900, 1.125rem / 18px, leading 1.3): Panel and section headings within cards (e.g., "โมดองทั้งหมด (12)"). The workhorse heading level.
- **Body** (600, 0.875rem / 14px, leading 1.5): All label text, form field labels, list item names, status text. The default type level for the UI.
- **Label** (600, 0.75rem / 12px, leading 1.4): State badges, chips, timestamps, and metadata tags. Always used on Surface Low or Surface White backgrounds; never used as standalone paragraph text.

### Named Rules
**The Weight-Over-Size Rule.** Hierarchy is expressed through font-weight contrast (900 vs. 600), not through large clamp-scaled headings. Display at 2.25rem is the ceiling. Headings do not scale with viewport width. Product UI has consistent density requirements at all screen sizes; fluid type creates inconsistent information density.

**The Thai-English Coexistence Rule.** Thai script (e.g., "โมดอง", "กำลังงมเข็ม") and English labels (e.g., "Admin", "Login") must share the same font stack. Do not introduce a separate Thai-specific webfont unless it is tested for weight-parity (a 900-weight Thai font that matches the system sans weight and x-height). An untested Thai webfont will create visible rhythm breaks between Thai and English runs.

## 4. Elevation

This system is near-flat. Depth is conveyed through the White/Warm-Paper contrast between card surfaces and page background, not through dramatic shadows. One shadow weight exists — `shadow-sm` — applied uniformly to all card and panel components. It is ambient and subtle: not structural, not interactive.

### Shadow Vocabulary
- **Surface lift** (`0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)`): Applied to all cards, panels, and forms. Applied at rest; does not change on hover. If this shadow were removed, the White-on-Paper contrast alone would still convey the layering.

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. The shadow-sm on cards is an ambient hint, not a structural elevation statement. There are no hover-lift effects, no modal-style deep shadows on inline components, no stacked shadow layers. When in doubt: remove the shadow, see if the surface still reads as distinct — if it does, the shadow was unnecessary.

## 5. Components

### Buttons
Confident and utilitarian. Rounded corners (6px) — not pill-shaped, not squared-off. Three variants; no more.

- **Shape:** Gently rounded (6px)
- **Primary:** Blue Chest background (`#2C52B3`), White Armor text, 12px vertical / 16px horizontal padding, font-black 900 at 0.875rem. Hover: darken to `#2246A0`. Focus: Blue Chest focus ring (2px offset, 2px outline).
- **Ghost:** Transparent background, Border Line border (1px), Black Joint text, same padding. Active / selected state: Dark Gray Weapons background (`#3A3D46`), white text. Used for navigation items and secondary actions.
- **Accent:** Red Feet background (`#FB2F38`), White Armor text. Used exclusively in the Wanted Items workflow and error/danger confirmation actions. Never combined with Primary on the same form.
- **Disabled:** 60% opacity on the active variant. No color change. `cursor: not-allowed`.

### Cards / Containers
All data surfaces are White Armor cards on the Armor Ground background. One shape, one shadow.

- **Corner Style:** Gently rounded (8px, `rounded-lg`)
- **Background:** White Armor (`#FFFFFF`)
- **Shadow:** Surface lift shadow-sm, applied at rest, does not animate
- **Border:** Border Line (`#CCCFD8`), 1px
- **Internal Padding:** 20px (`p-5`) standard; 12px (`p-3`) for compact list items within a card

Nested cards are prohibited. A card inside a card means the information architecture needs restructuring.

### Inputs / Fields
- **Style:** White Armor background, Border Line border (1px), 6px radius, 44px height for single-line inputs
- **Focus:** Border shifts to Blue Chest (`#2C52B3`). No glow, no shadow change. The border-color change is the only focus indicator for non-keyboard users; an additional visible focus ring (2px outline, Blue Chest, 2px offset) is required for keyboard navigation.
- **Error:** Border shifts to Red Feet (`#FB2F38`). Error message below the field in Red Feet at 0.875rem.
- **Disabled:** 50% opacity. `cursor: not-allowed`.
- **Textarea:** Same vocabulary, min-height 80px, consistent padding.

### State Badges / Chips
Used for Modong State tags and Collectible Kind labels inline within list items.

- **Style:** Surface Low background (`#DCDDE9`), Black Joint text, 4px radius, 2px / 6px padding
- **Size:** Label type (0.75rem, font-semibold 600)
- **Thai states** (โมดอง, ต่อไม่เสร็จ, etc.) are displayed verbatim — never translated or abbreviated

### Navigation
The sidebar nav uses Ghost button vocabulary: transparent at rest, Border Line border, Ink Deep text. Active: Ink Deep background, white text.

- **Link shape:** Same 6px radius as buttons, full-width, 8px vertical / 12px horizontal padding
- **Active state:** `bg-foreground text-white border-foreground` — the whole nav item inverts to Dark Gray Weapons fill, not just the text color
- **Hover:** Border shifts to Blue Chest (Blue Chest is the hover signal; Red Feet is reserved for danger/Wanted actions)
- **Mobile:** The sidebar collapses to an off-canvas drawer. Nav items maintain identical visual vocabulary.

### Share Cards (Public Surface)
The `/s/[token]` share pages are the only public-facing surface. They use the same White Armor card on Armor Ground, but at a larger radius (16px, `rounded-2xl`) and with a stronger shadow (`shadow-md`) to convey the "card you'd send to someone" quality. No prices, no private notes — the card's visual restraint reflects the data restraint.

## 6. Do's and Don'ts

### Do:
- **Do** use Blue Chest exclusively for the single most important action on any screen. One primary button, one active indicator per view.
- **Do** use Red Feet for error states, danger confirmations, and the Wanted Items workflow accent. Keep the two chromatic voices separated.
- **Do** use Yellow Vent (`#FFF867`) only as a badge background paired with Black Joint text — never as text color on any background.
- **Do** write Thai state names verbatim in badges: "กำลังงมเข็ม", not "Searching". The collector vocabulary is part of the product's identity.
- **Do** treat White Armor cards on Armor Ground as the primary depth signal. That contrast does the work; the shadow is redundant confirmation.
- **Do** use font-weight contrast (900 vs. 600) as the primary hierarchy tool. A Title at 900 reads as more important than Body at 600 even at the same size.
- **Do** show Gray Frame text (`#5A5B6D`) only on White Armor or Surface Low. Verify it clears 4.5:1 against its background (it achieves 6.7:1 on white).
- **Do** keep interactive state vocabulary consistent: hover = Blue Chest border shift, active/selected = Dark Gray Weapons fill, primary action = Blue Chest fill, error/danger = Red Feet fill.

### Don't:
- **Don't** use social media feed patterns: no algorithmic ordering of items, no engagement metrics (likes, views, follower counts), no public-by-default layouts. Sharing is intentional and manual in Dongmodel.
- **Don't** use marketplace UI patterns: no price-forward card grids, no "buy now" / "add to cart" affordances, no rating stars or review counts.
- **Don't** use generic productivity dashboard patterns: no "streamline your workflow" copy, no progress rings, no KPI hero metrics, no corporate tone.
- **Don't** nest cards. A card inside a card (`rounded-lg border inside rounded-lg border`) means the information hierarchy is broken. Flatten the structure.
- **Don't** use Blue Chest on inactive states, hover effects, or decorative elements. It loses its meaning immediately.
- **Don't** use Yellow Vent as text color or on white surfaces — contrast is 1.1:1, which is unreadable.
- **Don't** introduce `border-left` as a colored accent stripe on cards or list items. It is prohibited by the shared absolute bans and reads as careless decoration in an archive context.
- **Don't** use gradient text (`background-clip: text`). Blue Chest is a solid, grounded choice; gradient treatment introduces unnecessary decoration.
- **Don't** introduce a Thai webfont unless weight-parity with the system sans is verified. Thai 900-weight rendering varies significantly across typefaces; a mismatch breaks the heading hierarchy at a glance.
- **Don't** animate page-load sequences. Users are in a task. State transitions (form submission, item creation, nav change) may use 150–200 ms ease-out transitions; orchestrated entrances are prohibited.
