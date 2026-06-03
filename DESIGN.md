---
name: Dongmodel
description: A personal collection ledger for Thai collectors — every modong recorded, every wanted item tracked.
colors:
  warm-paper: "#F5F3F3"
  ink-deep: "#191B24"
  collector-red: "#D11A26"
  archive-teal: "#328F8C"
  surface-low: "#DBE1E6"
  ink-mid: "#575C6B"
  border-line: "#CBCFD8"
  surface-white: "#FFFFFF"
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
    backgroundColor: "{colors.collector-red}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "#b31620"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  button-ghost-active:
    backgroundColor: "{colors.ink-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.ink-deep}"
    rounded: "{rounded.sm}"
    height: "44px"
  state-badge:
    backgroundColor: "{colors.surface-low}"
    textColor: "{colors.ink-deep}"
    rounded: "4px"
    padding: "2px 6px"
---

# Design System: Dongmodel

## 1. Overview

**Creative North Star: "The Personal Archive"**

Dongmodel is a personal ledger kept by someone who knows their stuff. It does not perform. It does not solicit engagement. It is the place where a Thai collector maintains a precise, private record — what they have, what they are hunting, what they paid, what they let go. Every element exists to serve that act of recording; nothing exists to impress an outside observer.

The visual system is quiet and functional. White card surfaces on a warm-neutral ground. Type that earns its hierarchy through weight alone — no size theatrics. A deep crimson primary that shows up exactly where action is required and nowhere else. The teal accent signals focus and secondary actions without competing for attention. There is very little motion; state changes are quick and informational, not choreographed.

This system explicitly rejects three temptations: the social media feed (algorithmic, engagement-oriented, public-by-default), the marketplace (price-forward, grid-heavy, shopping-coded), and the generic SaaS dashboard (blue primary, corporate copy, productivity-tool sterility). The interface belongs to the collector, not to the platform.

**Key Characteristics:**
- Near-flat elevation — one shadow weight, used consistently
- Weight-only type hierarchy — system-ui at 900/700/600, no size clamp theatrics
- Crimson and teal as the only chromatic voices — not for decoration
- Dense information where the collector needs it — no padding inflation for "breathing room"
- Thai-first copy and English chrome coexist without visual conflict
- Private by default: nothing about the layout implies the content is meant to be seen by others

## 2. Colors: The Archive Palette

The palette is restrained: a warm neutral ground, a deep ink, one primary action color, one secondary action color, and neutral surface layers. No color is decorative.

### Primary
- **Collector Red** (`#D11A26`): The single chromatic voice for primary actions, error states, and the one place the UI says "this matters." Used on primary buttons, active status indicators, error messages, and the status line at the top of each dashboard section. Its rarity is the point.

### Secondary
- **Archive Teal** (`#328F8C`): Focus rings, secondary action buttons (Wanted Items workflow), accent icons, and the active-border on focused form controls. Contrasts with Collector Red without competing — they never appear together as equal-weight calls to action.

### Neutral
- **Warm Paper** (`#F5F3F3`): The page background. Tinted 5% toward the brand's own red hue (hsl 356°) rather than the default warm yellow-orange. Barely perceptible but removes the AI cream tell.
- **Ink Deep** (`#191B24`): Body text, active nav states, primary labels. Near-black with a cool-blue undertone.
- **Surface White** (`#FFFFFF`): All card and panel surfaces. The cards float on Warm Paper; the white/paper contrast is the primary depth signal.
- **Surface Low** (`#DBE1E6`): Icon background chips and muted surface layers (state rows, inactive badges). Never used as a text background for body copy.
- **Ink Mid** (`#575C6B`): Secondary text, metadata, placeholder copy, muted-foreground labels. Must clear 4.5:1 against Surface White.
- **Border Line** (`#CBCFD8`): Card borders, input outlines at rest, dividers. The single border weight used everywhere.

### Named Rules
**The One Primary Rule.** Collector Red appears on ≤2 elements per screen at any one time. It is reserved for the single most important action and for error or warning signals. Using it decoratively — side accents, icon colors, section dividers — dilutes its meaning and is prohibited.

**The Warm Paper Rule.** Background is now `#F5F3F3` (hsl 356° 5% 96%) — tinted toward Collector Red, not toward warm yellow-orange. The rule stands: if lightness or saturation is ever revisited, always tint toward hue 356° (the brand's own direction), never toward the warm-cream band (hue 40-100). Warmth in this system is carried by Collector Red and collector photos, not by the page ground.

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
- **Primary:** Collector Red background (`#D11A26`), white text, 12px vertical / 16px horizontal padding, font-black 900 at 0.875rem. Hover: darken to `#B31620`. Focus: Archive Teal focus ring (2px offset).
- **Ghost:** Transparent background, Border Line border (1px), Ink Deep text, same padding. Active / selected state: Ink Deep background, white text. Used for navigation items and secondary actions.
- **Accent:** Archive Teal background (`#328F8C`), white text. Used exclusively in the Wanted Items workflow where Teal is already the accent context signal. Never combined with Primary on the same form.
- **Disabled:** 60% opacity on the active variant. No color change. `cursor: not-allowed`.

### Cards / Containers
All data surfaces are white cards on the Warm Paper background. One shape, one shadow.

- **Corner Style:** Gently rounded (8px, `rounded-lg`)
- **Background:** Surface White (`#FFFFFF`)
- **Shadow:** Surface lift shadow-sm, applied at rest, does not animate
- **Border:** Border Line (`#CBCFD8`), 1px
- **Internal Padding:** 20px (`p-5`) standard; 12px (`p-3`) for compact list items within a card

Nested cards are prohibited. A card inside a card means the information architecture needs restructuring.

### Inputs / Fields
- **Style:** Surface White background, Border Line border (1px), 6px radius, 44px height for single-line inputs
- **Focus:** Border shifts to Archive Teal (`#328F8C`). No glow, no shadow change. The border-color change is the only focus indicator for non-keyboard users; an additional visible focus ring (2px outline, Archive Teal, 2px offset) is required for keyboard navigation.
- **Error:** Border shifts to Collector Red (`#D11A26`). Error message below the field in Collector Red at 0.875rem.
- **Disabled:** 50% opacity. `cursor: not-allowed`.
- **Textarea:** Same vocabulary, min-height 80px, consistent padding.

### State Badges / Chips
Used for Modong State tags and Collectible Kind labels inline within list items.

- **Style:** Surface Low background (`#DBE1E6`), Ink Deep text, 4px radius, 2px / 6px padding
- **Size:** Label type (0.75rem, font-semibold 600)
- **Thai states** (โมดอง, ต่อไม่เสร็จ, etc.) are displayed verbatim — never translated or abbreviated

### Navigation
The sidebar nav uses Ghost button vocabulary: transparent at rest, Border Line border, Ink Deep text. Active: Ink Deep background, white text.

- **Link shape:** Same 6px radius as buttons, full-width, 8px vertical / 12px horizontal padding
- **Active state:** `bg-foreground text-white border-foreground` — the whole nav item inverts, not just the text color
- **Hover:** Border shifts to Archive Teal (not Collector Red — Teal is the hover signal, Red is reserved for actions)
- **Mobile:** The sidebar collapses to an off-canvas drawer. Nav items maintain identical visual vocabulary.

### Share Cards (Public Surface)
The `/s/[token]` share pages are the only public-facing surface. They use the same White card on Warm Paper, but at a larger radius (16px, `rounded-2xl`) and with a stronger shadow (`shadow-md`) to convey the "card you'd send to someone" quality. No prices, no private notes — the card's visual restraint reflects the data restraint.

## 6. Do's and Don'ts

### Do:
- **Do** use Collector Red exclusively for the single most important action on any screen and for error states. One button, one error message, one status line.
- **Do** use Archive Teal for focus rings, hover borders on nav items, and the Wanted Items workflow (where it is the contextual accent color). Keep the two chromatic voices separated.
- **Do** write Thai state names verbatim in badges: "กำลังงมเข็ม", not "Searching". The collector vocabulary is part of the product's identity.
- **Do** treat white cards on the page background as the primary depth signal. That contrast does the work; the shadow is redundant confirmation.
- **Do** use font-weight contrast (900 vs. 600) as the primary hierarchy tool. A Title at 900 reads as more important than Body at 600 even at the same size.
- **Do** show Ink Mid text (`#575C6B`) only on Surface White or Surface Low. Verify it clears 4.5:1 against its background.
- **Do** keep interactive state vocabulary consistent: hover = teal border shift, active/selected = Ink Deep fill, primary action = Collector Red fill.

### Don't:
- **Don't** use social media feed patterns: no algorithmic ordering of items, no engagement metrics (likes, views, follower counts), no public-by-default layouts. Sharing is intentional and manual in Dongmodel.
- **Don't** use marketplace UI patterns: no price-forward card grids, no "buy now" / "add to cart" affordances, no rating stars or review counts.
- **Don't** use generic SaaS dashboard patterns: no blue primary color, no "streamline your workflow" copy, no progress rings, no KPI hero metrics.
- **Don't** nest cards. A card inside a card (`rounded-lg border inside rounded-lg border`) means the information hierarchy is broken. Flatten the structure.
- **Don't** use Collector Red on inactive states, hover effects, or decorative elements. It loses its meaning immediately.
- **Don't** introduce `border-left` as a colored accent stripe on cards or list items. It is prohibited by the shared absolute bans and reads as careless decoration in an archive context.
- **Don't** use gradient text (`background-clip: text`). Collector Red is a solid, grounded choice; gradient treatment introduces unnecessary decoration.
- **Don't** introduce a Thai webfont unless weight-parity with the system sans is verified. Thai 900-weight rendering varies significantly across typefaces; a mismatch breaks the heading hierarchy at a glance.
- **Don't** animate page-load sequences. Users are in a task. State transitions (form submission, item creation, nav change) may use 150–200 ms ease-out transitions; orchestrated entrances are prohibited.
