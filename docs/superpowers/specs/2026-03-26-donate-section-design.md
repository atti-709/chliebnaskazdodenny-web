# Donate Section ("Podporte nás") — Design Spec

## Overview

Add a donation section to the existing Contact page and a footer link for site-wide discoverability. The section displays a QR code and bank account details for supporters who want to contribute financially.

## Changes

### 1. Contact Page — New Donation Section

**File:** `src/components/Contact.jsx`

Add a new section inside the existing content card (the `border-l-[4px]` styled div), below the "Slovenské vydanie" section. Separated by the same `border-t border-chnk-dark/20 pt-6` divider used between existing sections.

**Content:**

- `id="podporte-nas"` anchor on the section div (for footer link scroll)
- Heading: `<h2>` "Podporte nás" — same style as other section headings (`text-xl font-display font-bold text-chnk-dark mb-4`)
- Body text: "Naša nezisková organizácia je plne prevádzkovaná z dobrovoľných darov a príspevkov jednotlivcom, či organizácií. Môžete podporiť našu činnosť zaslaním finančného daru na účet:"
- Layout: flex row with QR code image on left, IBAN/BIC on right. Wraps to column on small screens.
  - QR code: `<img>` from `src/assets/qr-donate.svg`, ~120px, white background with rounded border
  - Account details:
    - **IBAN:** SK15 5600 0000 0060 1444 0004
    - **BIC:** KOMASK2X

### 2. Footer — "Podporte nás" Link

**File:** `src/components/Footer.jsx`

Add a `<Link to="/kontakt#podporte-nas">` next to the existing "Kontakt" link. Same styling: `font-display font-bold text-sm md:text-base text-chnk-primary hover:text-white transition-colors duration-300`.

### 3. Contact Page — Scroll to Anchor

**File:** `src/components/Contact.jsx`

Add a `useEffect` that checks for `#podporte-nas` in the URL hash on mount and scrolls the element into view with smooth scrolling.

### 4. Placeholder QR Code

**File:** `src/assets/qr-donate.svg`

A simple placeholder SVG (gray square with "QR" text) that the user will replace with the real QR code image later.

## What stays the same

- Devotional page (`DevotionalContent.jsx`) — untouched
- No new routes added
- Visual style matches existing Contact page sections exactly
- Footer layout structure preserved (just one more link added)

## Files Modified

| File | Change |
|------|--------|
| `src/components/Contact.jsx` | Add donation section + scroll-to-anchor effect |
| `src/components/Footer.jsx` | Add "Podporte nás" link |
| `src/assets/qr-donate.svg` | New placeholder QR code image |
