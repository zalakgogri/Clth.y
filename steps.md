# CLTH.Y — Reproducible Build Log (`steps.md`)

Every implementation prompt, in strict order. Re-running them in sequence rebuilds the project.

```
CLTH.Y/            (after Step 9 everything lives in this ONE folder)
├── src/           # React + Vite + Tailwind v4 frontend
├── server/        # Express server: Claude prompts, link verification
├── package.json   # one install, one `npm run dev`
├── .env           # ANTHROPIC_API_KEY (not committed)
└── steps.md       # This file
```
Steps 0–8 were originally built in `API/` and `UI/`; Step 9 merges them.

---

## Step 0: Repository & Workflow Initialization
Initialize the project structure with two primary directories: `API/` (backend services and endpoints) and `UI/` (frontend web application). Maintain a persistent `steps.md` in the project root recording every implementation prompt and instruction in strict sequential order so the build is 100% reproducible anywhere.

## Step 1: CLTH.Y AI Celebrity-Grade Image Diagnostics & On-Person Styling Engine — Specification & Setup
Implement the complete full-stack web app inside `UI/` using React (Vite), Tailwind CSS, Lucide Icons and React Router DOM.

**1. Visual & architectural identity** — Korean Clinical Precision meets Modern Luxury Editorial (DOES Clinic, Hongdae, Seoul).
Palette: Primary Velvet Wine `#4A121A`; Terracotta Gold `#C35831` / `#D4AF37`; Soft Linen Cream `#FAF7F2`; Pure White `#FFFFFF`; Dark Charcoal `#1E1E1E`; Muted Bronze-Grey `#7A6B68`; Subtle Borders `#E8E2D8`.
Type: Cormorant Garamond / Playfair Display (editorial serif headings); Plus Jakarta Sans / Inter (biometric tables & body).

**2. Routes & pages**
1. `/` Hero & Entry Gate (DOES methodology, 3-step workflow, privacy guarantees, CTA).
2. `/intake` Dual Intake Chamber — Part A: 5-Photo Capture (Front Face, Side Face 90°, Full Body Front, Side Full Body, Candid Pose) with guides, camera/upload, instant sample loaders. Part B: Demographics & Preferences (height cm/ft, weight kg/lbs, age, gender, heritage, shopping apps [Myntra, Ajio, Tata CLiQ, Zara, H&M], budget tiers/sliders, occasions, style genres, custom fit).
3. `/analyzing` AI Diagnostic Calibration Scanner (radar animations, 5-phase ticker: LAB undertones, facial thirds 0.88, Wave / Soft Classic frame, DOES Passport).
4. `/report` South Korean All-in-One Diagnostic Report (6 power + 6 dissonant swatches, facial neckline guides, Wave/Classic tailoring, Fabric & Hardware matrix, Mandatory User Approval Gate).
5. `/wardrobe` Dual Curation Hub (10 algorithmic looks ⇄ natural-language prompts, occasion chips, 10 three-piece cards, bundle discounts, outbound store tags).
6. `/tryon/:id` On-Person Try-On Canvas (Front/Side/Candid, raw-photo comparison, 98% suitability, itemised cart with retail links, swapper modal, wishlist).
7. `/studio` Mix & Match Studio (3 carousels, live Harmony Calculator for colour/waistline/neckline, live swatches, wishlist).
8. `/saved` Saved Lookbook & Client PDF Export (localStorage, print stylesheet for luxury client dossiers).

**3. State** — persist everything under `clthy_user_profile` in `localStorage` with full preset fallbacks so the app works with or without real photo uploads.

## Step 2: UI Vite Scaffolding & Tailwind CSS v4 Theme Engine
1. In `UI/`: `npx -y create-vite ./ --template react --no-interactive --overwrite`
2. `npm install && npm install lucide-react react-router-dom canvas-confetti && npm install -D tailwindcss @tailwindcss/vite`
3. `UI/vite.config.js`: register `@tailwindcss/vite` and `@vitejs/plugin-react`.
4. `UI/index.html`: import Google Fonts Cormorant Garamond + Plus Jakarta Sans; title "CLTH.Y — AI Celebrity-Grade Image Diagnostics & On-Person Styling Atelier".
5. `UI/src/index.css`: `@import "tailwindcss";`, `@theme` tokens (`--color-wine #4A121A`, `--color-gold #C35831`, `--color-gold-warm #D4AF37`, `--color-cream #FAF7F2`, `--color-charcoal #1E1E1E`, `--color-bronze #7A6B68`, `--color-subtle-border #E8E2D8`) and keyframes `scanLaser`, `radarSweep`.

## Step 3: Data layer (`UI/src/data/`)
1. `defaultProfile.js`: `DEFAULT_PHOTOS` (5 slots), `DEFAULT_DEMOGRAPHICS` (165 cm, 58 kg, 24, Female, Pune/Western India, apps Myntra/Ajio/Zara-H&M, Mid-Range Contemporary, Smart Casual/Workwear, custom fit), `DEFAULT_DIAGNOSTIC_REPORT` (DOES Hongdae #KR-8821): power colours Velvet Burgundy `#5B141C`, Emerald Forest `#134E39`, Terracotta Amber `#C45D36`, Espresso Noir `#3B2219`, Golden Ochre `#DDA15E`, Imperial Brushed Gold `#D4AF37`; dissonant Icy Cyan Blue `#E0F7FA`, Cool Ash Lilac `#E1BEE7`, Chalk Sleet Grey `#B0BEC5`, Optical Stark White `#FFFFFF`, Fluorescent Magenta `#FF1493`, Acidic Neon Green `#00E676`; facial Compact Middle-Third 0.88 with sweetheart/cowl/boatneck; Wave / Soft Classic, high-waist, fluid drape; fabrics mulberry silk, satin charmeuse, modal crepe, antique brushed gold.
2. `outfitsData.js`: `OUTFITS` — 10 three-piece looks with Myntra/Ajio/Tata CLiQ/Zara/H&M metadata, bundle discounts, DOES harmony rationales.
3. `studioItems.js`: `STUDIO_TOPS/BOTTOMS/SHOES` (10 each) + `calculateHarmonyMetrics(top, bottom, shoe)` (colour temperature, neckline vs middle-third, Wave high-rise, ergonomic heel).
4. `storage.js`: `getUserProfile`, `saveUserProfile`, `updateDemographics`, `updatePhotos`, `approveReport`, `toggleWishlist` on key `clthy_user_profile`.

## Step 4: Reusable components (`UI/src/components/`)
`Navbar.jsx` (sticky, Hongdae badge, persona tracker, links, reset, CTA) · `Footer.jsx` (DOES accreditation, privacy pledge, retail tags) · `PhotoUploadCard.jsx` (`capture="user"`, drag-drop, sample loader, silhouette guide, preview) · `OutfitCard.jsx` (occasion badge, suitability meter, itemised pieces, bundle savings, harmony rationale, "View On-Person Try-On").

## Step 5: 8 pages (`UI/src/pages/`) + routing
`HomePage`, `IntakePage` (two tabs, unit toggles, validation gate), `AnalyzingPage` (laser + radar, 5-step ticker → `/report`), `ReportPage` (swatches, approval gate "Confirm & Style Me" with confetti), `WardrobePage` (Mode A curated / Mode B prompt with reasoning + chips, occasion filter), `TryOnPage` (60/40 split, angles, raw compare, suitability, links, customise modal), `StudioPage`, `SavedPage` (`@media print`). Wire in `App.jsx` with `BrowserRouter` and `ScrollToTop`.

## Step 6: Backend (`API/`)
Express service: `package.json` (express, cors); `server.js` with `GET /api/health` (status + engine version) and `POST /api/diagnose` (5 photos + demographics → 18-parameter DOES diagnostic JSON).

## Step 7: Build validation & end-to-end verification
Run `npm run build` in `UI/`; launch `npm run dev`; tour Home → Intake → Analyzing → Report → Wardrobe → Try-On → Studio → Saved.

## Step 8: Diagnostic Feature Extraction Matrix, Client Worksheet, PDF/JSON download, direct retail links
1. `UI/src/data/diagnosticMatrix.js` + `ReportPage.jsx`: keep all existing sections (6 power / 6 dissonant colours with risks); append the 5-Module Feature Extraction Matrix (M1 Personal Color: Temperature, Saturation, Brightness, Facial Reaction, Contrast, Achromatic Base; M2 Facial Proportions: Thirds, Face Shape/Jaw, Curvature, Feature Scale; M3 Body & Silhouette: Honebana, Shoulder/Clavicle, Center of Gravity, Hip/Glute Apex, Neckline; M4 Material: Weight, Finish/Luster, Pattern Scale, Drape; M5 Styling: Hardware, Hairstyle, Accessory/Eyewear) with measurements, scales and dual impacts (clothing vs makeup & styling). Append the Client Consultation Intake & Feature Diagnosis Sheet (client name, consultant team, date, session type; 18 codes PC-01–05, FP-01–04, BT-01–04, TX-01–02, MK-01–03 with parameter, observed value, rating, recommendation). Add **Download Diagnostic Analysis Dossier** (PDF via `@media print`) and **Download JSON Diagnostic Dossier**.
2. `OutfitCard.jsx` / `WardrobePage.jsx`: each of the 3 pieces shows a direct "Buy on <Platform> ↗" link opening in a new tab.

---

## Step 9: Merge into a single folder
Remove the separate `API/` and `UI/` directories: move the Vite app (`src/`, `public/`, `index.html`, `vite.config.js`, `package.json`) to the project root and create `server/` for the Express code. One `npm install`; `npm run dev` runs Express (port 4000) and Vite together via `concurrently`, with Vite proxying `/api` to Express. `npm run build && npm start` serves the built UI and API from the one server. Add `.env.example` (`ANTHROPIC_API_KEY`, optional `CLAUDE_MODEL`, `PORT`, `OUTFIT_COUNT`) and git-ignore `.env`.

## Step 10: Prompt 1 — Korean master colour analysis with Claude (`POST /api/analyze`)
Install `@anthropic-ai/sdk`. When the client submits intake, the browser sends their *uploaded* photos (resized JPEGs from `localStorage`; SVG sample drawings are never sent) and typed demographics to the server. `server/claude.js` attaches the photos as labelled image blocks to a fixed prompt (`server/prompts.js`): Claude acts as a senior DOES Clinic (Hongdae, Seoul) master analyst and returns one JSON report — season/undertone, 6 power + 6 dissonant hex colours with reasons, facial thirds & necklines, bone-frame (honebana) & rise, fabrics/hardware, a finding for each of the 22 matrix parameters, and the 18 feature codes (PC/FP/BT/TX/MK). The prompt forbids identifying people or inferring ethnicity/health/age and requires uncertainty to be stated in `photoNotes`. The result replaces the preset report and is shown on `/report` (with a "personalised by Claude" or "demo" banner). The key stays server-side.

## Step 11: Prompt 2 — outfits from photos + analysis + chosen stores, with exact product links (`POST /api/outfits`)
After the user approves the report, `/wardrobe` sends the same photos, the Step 10 analysis, the demographics (budget, occasion, styles, custom fit) and the selected stores to a second prompt. Claude, with the server-side web-search tool restricted (`allowed_domains`) to the selected stores' domains, builds three-piece looks (top + bottom + shoes) and must return each piece's own `productUrl`. Natural-language requests on Mode B go through the same endpoint. **A link is attached only if** (1) it is on that store's own domain, (2) its path matches that store's single-product-page pattern (Myntra `…/<id>/buy`, Ajio `…/p/<id>`, Tata CLiQ `…-p-mp<id>`, Zara `…-p<id>.html`, H&M `productpage.<id>.html`), and (3) the exact URL appeared in Claude's web-search results in that request (`server/stores.js`). Otherwise the piece shows "no exact link" — never a search or home-page URL. The old generated search links were removed. Mix & Match Studio and Try-On swapper draw from these real linked pieces when they exist.

## Step 12: Intake revisions
1. Remove the Hongdae / Seoul location text everywhere (navbar badge, footer, home, report metadata, prompts).
2. Part A becomes a 4-slot Photo Chamber — Front Face, Left Side, Right Side, Full Body — each showing a real example-pose photo (`public/examples/*.jpg`, generated once with an image model; the people are fictional) until the user adds their own. Camera now opens a live in-browser camera (`getUserMedia`, `CameraModal.jsx`) with capture, flip and a 5 s timer (default on for full body); if the camera is blocked it falls back to the device camera app / upload. The sample-drawing presets are removed from the UI; "Use demo diagnosis (no photos)" remains. Stored photos from the old 5-slot layout are discarded (storage `schema: 2`).
3. Part B: remove Budget tier and Style genres; keep the per-look budget slider; add an "Others" primary occasion with a free-text box. The chosen (or typed) occasion is what the stylist prompt receives, so any occasion can be styled.

## Step 13: Analysis driven by the client's own matrix PDF
Source: "Personal Color & Styling: Diagnostic Feature Extraction Matrix" (Feature Extraction Checklist PDF). `src/data/diagnosticMatrix.js` is now transcribed row-for-row from it: 5 modules / 22 sub-features, each with Measurement/Diagnostic Method, Classification Options & Scales, Impact on Clothing Selection, Impact on Makeup & Styling. The analysis prompt (`server/prompts.js`) embeds the whole matrix and requires one entry per sub-feature: a classification chosen only from that row's options, photo evidence, a confidence level (drape tests can't be done from a photo, so confidence is lowered), and personalised clothing and makeup advice. `/report` shows each row as: method · scale · your result · clothing impact · makeup impact (personalised advice above the matrix's general text). Failures of the AI call now show an error with retry instead of silently using the demo diagnosis.

---

## Build notes (what was actually done)
- Vite 8 / React 19 / Tailwind v4; tokens in `@theme`. Model: `claude-opus-5-5` (override with `CLAUDE_MODEL`); adaptive thinking; web search tool `web_search_20260209` (override `WEB_SEARCH_TOOL`).
- Without `ANTHROPIC_API_KEY` or without uploaded photos the app falls back to the demo diagnosis and demo looks (no product links), with a visible banner.
- Photos & try-on figures are offline SVG; try-on is a procedural renderer (`ModelFigure.jsx`), not generative AI.
- Run: `npm install && cp .env.example .env` (add your key) `&& npm run dev`.
