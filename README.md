# 🍔 DABBOOS (دبوس) — Luxury Interactive Restaurant Website

> An award-winning, high-energy, promotional single-page scrolling experience built for **DABBOOS (مطعم دبوس)**. Engineered with Awwwards-grade motion design, Street-Food Neo-Brutalism, interactive 2D physics, and buttery 60fps smooth scrolling.

---

## 🎨 Brand Identity & Palette
- **Primary Red (Chili/Sauce Red):** `#E62419`
- **Primary Royal Blue (Dabboos Blue):** `#0A1996`
- **Cream / Off-White Canvas:** `#F9F6F0`
- **Mustard / Cheese Yellow:** `#F5C518`
- **Packaging Pattern:** Subtle Arabic Calligraphy & Flame vector grid (`#1528B8`)
- **Typography:**
  - **Headings:** *Anton* & *Bebas Neue* (Ultra-condensed, brutalist display)
  - **3D Retro Extruded Text:** *Bungee* with layered multi-stop colored shadows (`#F5C518`, `#E62419`, `#0A1996`, `#000`)
  - **Bilingual Arabic Body & Accents:** *Readex Pro* & *Tajawal*
  - **Micro-copy:** *Space Grotesk*

---

## ⚡ Core Technical Architecture & Features

### 1. 🍔 Preloader Screen (0% to 100%)
- **Layer-by-Layer Assembly:** An illustrated cartoon burger builds itself sequentially (bottom bun, crispy patty, melted cheese drip, fresh lettuce, spicy sauce droplets, sesame top bun, and blinking googly cartoon eyes).
- **Dynamic Messaging:** Condensed typography cycling from `"PREPARING TO SERVE THE DABBOOS MASTERY..."` to `"READY TO DABBOOS!"` with authentic Arabic translations.
- **Wave Reveal Exit Transition:** Multi-layered SVG wave curtains (Red `#E62419`, Royal Blue `#0A1996`, Mustard Yellow `#F5C518`) sweep upwards with staggered easing to reveal the Hero Section.

### 2. 📌 Sticky Header & Blur Overlay Menu
- **Sticky Glass Navbar:** Top-left bold red DABBOOS pin logo, red pill CTA (`ORDER NOW`), and hamburger toggle (`MENU ≡`).
- **Menu Interaction:** Full-screen backdrop blur (`backdrop-filter: blur(16px)`) with an animated floating red card (`#E62419`) in the top-right corner, staggered links, hotline badge, and responsive drawer controls.

### 3. 💥 Section 1: Hero Section (`#F9F6F0` Cream Background)
- **Background Typography:** Edge-to-edge giant red condensed text reading **`THE BURGER`**.
- **Floating Badges:** Tilted yellow/red neo-brutalist sticker tags (`"SMASHED & CRISPY"` and `"BOLD SPICY FLAVOR"`).
- **Parallax Centerpiece:** High-resolution signature crispy burger cutout with steam puffs and interactive cartoon googly eyes whose pupils track the user's cursor.
- **3D Extruded Title:** Yellow retro extruded text **`DABBOOS`** overlapping the lower half of the burger.
- **Corner Cards:** Editorial micro-copy describing the 48-hr spice brine, toasted brioche, and aged molten cheddar.

### 4. 🧀 Section 2: "Juicy Cheesy Fully Loaded" & Polaroid Gallery
- **Scroll Scale Transition:** Smoothly scales down into the centered headline:
  - Small badge: `"TOP CLASSIC SELECTION"`
  - 3-line headline: **`JUICY CHEESY FULLY LOADED`**
  - Centered red pill button: `ORDER NOW`.
- **Fan-out Polaroid Cards:** 3 tilted Polaroid-style photo cards (*Loaded Fries*, *Quad Crispy Burger*, *Volcano Sauce*) that fan out across the screen on scroll with 3D perspective spring tilt physics on hover.
- **Floating Cartoon Mascots:** Smiling Fry Box and Chili Pepper retro mascots bobbing with gentle CSS keyframes.

### 5. 🌊 Section 3: Liquid Wave Transition & Cartoon Mascot (`#E62419` Red)
- **Transition:** Thick dripping red hot sauce SVG wave divider filling the screen with `#E62419`.
- **Center Graphic:** Large double burger illustration with cartoon eyes, steam, smiling face, and white cartoon gloves/hands holding its sides playfully, tagged with a tilted `"BOLD FLAVOUR"` badge.

### 6. 🥬 Section 4: Full-Width Macro Close-Up & Falling Ingredients Parallax
- **Full-Viewport Macro Hero:** Hands holding a dripping loaded burger with the quote *"UNAPOLOGETICALLY MESSY. UNFORGETTABLY CRISPY."*
- **Exploded Ingredients Scroll:** GSAP ScrollTrigger multi-axis parallax scrubbing lettuce, sliced tomatoes, cheddar cheese, sizzled patties, and chili peppers across **`EVERY LAYER PACKED WITH SIGNATURE FLAVOR`**.

### 7. ✈️ Section 5: Motion-Path Travel Section (`#0A1996` Royal Blue)
- **Visuals:** Royal Blue section with subtle Arabic calligraphy/flame pattern and curved wavy dividers.
- **GSAP MotionPath:** A cartoon paper airplane with chili flame thruster travels along a dashed curved flight path across the screen.
- **City Waypoints:** Polaroid cards for **Jeddah**, **Riyadh**, **Damascus**, and **Dubai** pop into view along the flight trajectory with elastic bounces!

### 8. 📰 Section 6: "Feel The Change" Split Editorial Section
- **Asymmetric 2-Column Layout:** Storytelling manifesto explaining the 48-hour marinade, street food rebellion, and chef mascot graphic.
- **Lifestyle Visual:** Large rounded-corner lifestyle photography of friends sharing a feast with `"100% FRESH DAILY"` badge.

### 9. ⚛️ Section 7: Interactive Physics Footer (Matter.js)
- **2D Physics Engine Canvas:** Real Matter.js physics bodies (lettuce leaves, tomato slices with seeds, cheddar slices, crispy burger patties with grill marks, sesame buns, and fries) fall from the top of the footer.
- **Interactive Stacking & Collision:** Ingredients bounce, tumble, and settle on top of the giant bottom **`DABBOOS`** letters and floor.
- **Interactive Mouse Dragging & Tossing:** Full mouse collision and `MouseConstraint` support to pick up, throw, and juggle ingredients!
- **Interactive Button:** Click `"🌶️ DROP MORE INGREDIENTS"` to shower fresh food items on demand!
- **Minimalist Links & Bilingual Copyright:** `HOME`, `BURGERS`, `LOADED FRIES`, `SPICES`, `LOCATIONS`, `CONTACT`.

---

## 🚀 Quick Start / How to Run

1. **Launch the local web server:**
   ```bash
   npm start
   ```
   Open your browser to: **`http://localhost:3000`** (or open `index.html` directly in any modern browser).

2. **Run Automated Browser Verifications:**
   ```bash
   npm run verify
   ```

3. **Capture High-Res Section Screenshots:**
   ```bash
   npm run capture
   ```

---

## 🛠️ Tech Stack
- **HTML5 & Tailwind CSS**
- **GSAP 3.12.5** (ScrollTrigger, MotionPathPlugin, Ticker Sync)
- **Lenis 1.1.18** (Studio Freight / Darkroom Smooth Scroll)
- **Matter.js 0.19.0** (2D Rigid-Body Physics Engine)
- **Google Fonts** (*Anton*, *Bebas Neue*, *Bungee*, *Readex Pro*, *Tajawal*, *Space Grotesk*)
