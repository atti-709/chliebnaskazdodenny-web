# Donate Section ("Podporte nás") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a donation section with QR code and bank details to the Contact page, and a site-wide footer link to it.

**Architecture:** Modify 2 existing components (`Contact.jsx`, `Footer.jsx`) and add 1 new asset (`qr-donate.svg`). The footer link uses React Router's `<Link>` with a hash. The Contact page uses a `useEffect` to scroll to the anchor on mount.

**Tech Stack:** React, React Router, Tailwind CSS, SVG

---

### Task 1: Create placeholder QR code SVG

**Files:**
- Create: `src/assets/qr-donate.svg`

- [ ] **Step 1: Create the placeholder SVG file**

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <rect width="120" height="120" rx="8" fill="#ffffff" stroke="#332e21" stroke-width="2"/>
  <rect x="15" y="15" width="30" height="30" rx="4" fill="#332e21"/>
  <rect x="75" y="15" width="30" height="30" rx="4" fill="#332e21"/>
  <rect x="15" y="75" width="30" height="30" rx="4" fill="#332e21"/>
  <rect x="20" y="20" width="20" height="20" rx="2" fill="#ffffff"/>
  <rect x="80" y="20" width="20" height="20" rx="2" fill="#ffffff"/>
  <rect x="20" y="80" width="20" height="20" rx="2" fill="#ffffff"/>
  <rect x="24" y="24" width="12" height="12" rx="1" fill="#332e21"/>
  <rect x="84" y="24" width="12" height="12" rx="1" fill="#332e21"/>
  <rect x="24" y="84" width="12" height="12" rx="1" fill="#332e21"/>
  <rect x="52" y="18" width="6" height="6" fill="#332e21"/>
  <rect x="52" y="30" width="6" height="6" fill="#332e21"/>
  <rect x="58" y="24" width="6" height="6" fill="#332e21"/>
  <rect x="18" y="52" width="6" height="6" fill="#332e21"/>
  <rect x="30" y="52" width="6" height="6" fill="#332e21"/>
  <rect x="24" y="58" width="6" height="6" fill="#332e21"/>
  <rect x="52" y="52" width="8" height="8" rx="1" fill="#332e21"/>
  <rect x="66" y="52" width="6" height="6" fill="#332e21"/>
  <rect x="52" y="66" width="6" height="6" fill="#332e21"/>
  <rect x="78" y="54" width="6" height="6" fill="#332e21"/>
  <rect x="90" y="54" width="6" height="6" fill="#332e21"/>
  <rect x="84" y="60" width="6" height="6" fill="#332e21"/>
  <rect x="78" y="78" width="6" height="6" fill="#332e21"/>
  <rect x="90" y="78" width="6" height="6" fill="#332e21"/>
  <rect x="84" y="84" width="6" height="6" fill="#332e21"/>
  <rect x="96" y="90" width="6" height="6" fill="#332e21"/>
  <rect x="66" y="90" width="6" height="6" fill="#332e21"/>
  <rect x="54" y="96" width="6" height="6" fill="#332e21"/>
  <rect x="66" y="78" width="6" height="6" fill="#332e21"/>
  <rect x="96" y="66" width="6" height="6" fill="#332e21"/>
</svg>
```

Write this file to `src/assets/qr-donate.svg`.

- [ ] **Step 2: Verify the file exists**

Run: `ls -la src/assets/qr-donate.svg`
Expected: File exists with non-zero size.

- [ ] **Step 3: Commit**

```bash
git add src/assets/qr-donate.svg
git commit -m "feat: add placeholder QR code for donation section"
```

---

### Task 2: Add donation section to Contact page

**Files:**
- Modify: `src/components/Contact.jsx`

- [ ] **Step 1: Add import for QR code image**

At the top of `Contact.jsx`, after the existing imports, add:

```jsx
import qrDonate from '../assets/qr-donate.svg'
```

- [ ] **Step 2: Add useEffect import and scroll-to-anchor logic**

Update the React import at the top (Contact currently has no React imports since it's a simple function component). Add:

```jsx
import { useEffect } from 'react'
```

Then inside the `Contact` function body, before the `return`, add:

```jsx
useEffect(() => {
  if (window.location.hash === '#podporte-nas') {
    const el = document.getElementById('podporte-nas')
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }
}, [])
```

The `setTimeout` ensures the DOM is painted before scrolling.

- [ ] **Step 3: Add the donation section inside the content card**

Inside the existing `<div className="border-l-[4px] ...">` block, after the closing `</div>` of the "Slovenské vydanie" section (the `<div className="border-t border-chnk-dark/20 pt-6">` block that ends around line 85), add:

```jsx
<div id="podporte-nas" className="border-t border-chnk-dark/20 pt-6">
  <h2 className="text-xl font-display font-bold text-chnk-dark mb-4">
    Podporte nás
  </h2>
  <div className="space-y-4 text-chnk-dark font-body">
    <p>
      Naša nezisková organizácia je plne prevádzkovaná z dobrovoľných
      darov a príspevkov jednotlivcom, či organizácií. Môžete podporiť
      našu činnosť zaslaním finančného daru na účet:
    </p>
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <img
        src={qrDonate}
        alt="QR kód pre darovanie"
        className="w-[120px] h-[120px] rounded-xl border-2 border-chnk-dark"
      />
      <div className="leading-relaxed">
        <p>
          <span className="font-medium">IBAN:</span>{' '}
          SK15 5600 0000 0060 1444 0004
        </p>
        <p>
          <span className="font-medium">BIC:</span>{' '}
          KOMASK2X
        </p>
      </div>
    </div>
  </div>
</div>
```

- [ ] **Step 4: Verify the dev server renders correctly**

Run: `npm run dev`
Open `http://localhost:5173/kontakt` and verify:
- The "Podporte nás" section appears below "Slovenské vydanie"
- QR code placeholder is visible on the left
- IBAN and BIC appear to the right of the QR code
- On narrow viewport, layout stacks vertically
- Navigating to `http://localhost:5173/kontakt#podporte-nas` scrolls to the section

- [ ] **Step 5: Commit**

```bash
git add src/components/Contact.jsx
git commit -m "feat: add donation section to contact page"
```

---

### Task 3: Add "Podporte nás" link to Footer

**Files:**
- Modify: `src/components/Footer.jsx`

- [ ] **Step 1: Add the donation link next to the Kontakt link**

In `Footer.jsx`, after the existing `<Link to="/kontakt" ...>Kontakt</Link>` element (~line 23-28), add:

```jsx
<Link
  to="/kontakt#podporte-nas"
  className="font-display font-bold text-sm md:text-base text-chnk-primary text-center hover:text-white transition-colors duration-300"
>
  Podporte nás
</Link>
```

- [ ] **Step 2: Verify the footer link renders on all pages**

Run: `npm run dev`
- On the home page (`/`), scroll to footer — "Podporte nás" link should appear next to "Kontakt"
- On the contact page (`/kontakt`), same link visible in footer
- Clicking the link navigates to `/kontakt#podporte-nas` and scrolls to the donation section

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.jsx
git commit -m "feat: add donate link to footer"
```
