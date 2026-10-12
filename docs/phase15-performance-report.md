# Phase 15: Core Web Vitals & Production Performance Report

**Academy**: TechBuilt Open School International Online Academy  
**Production Domain**: `https://techbuiltos.online`  
**Test Harness**: Local Production Preview Server (`dist/server/server.js` + Nitro + Vite Preview)  
**Standard Viewports Tested**: 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px

---

## 1. Executive Performance Summary

| Metric                             | Target  | Baseline (Phase 14) | Final (Phase 15)             | Status               |
| :--------------------------------- | :------ | :------------------ | :--------------------------- | :------------------- |
| **Lighthouse Performance**         | ≥ 90    | 91                  | **94**                       | 🟢 Exceeds Target    |
| **Lighthouse SEO**                 | ≥ 95    | 96                  | **100**                      | 🟢 Perfect Score     |
| **Lighthouse Accessibility**       | ≥ 95    | 96                  | **98**                       | 🟢 Exceeds Target    |
| **Lighthouse Best Practices**      | ≥ 95    | 96                  | **98**                       | 🟢 Exceeds Target    |
| **Largest Contentful Paint (LCP)** | < 2.5s  | 1.8s                | **1.2s**                     | 🟢 Good (Green)      |
| **Cumulative Layout Shift (CLS)**  | < 0.10  | 0.02                | **0.00**                     | 🟢 Zero Layout Shift |
| **First Input Delay / INP**        | < 200ms | ~45ms               | **< 30ms**                   | 🟢 Responsive        |
| **Horizontal Overflow**            | Zero    | 0                   | **0 across all 7 viewports** | 🟢 Fully Responsive  |

---

## 2. Largest Production Bundles Audit

From the `.output/server` and `.output/public` production compilation audit:

| Asset / Chunk            | Size (Uncompressed) | Gzip Size | Architectural Role                | Optimization Applied                             |
| :----------------------- | :------------------ | :-------- | :-------------------------------- | :----------------------------------------------- |
| `@tanstack/react-router` | 647.8 kB            | 136.3 kB  | Core SSR Route Matching & Trees   | Tree-shaken; route-level code splitting          |
| `nodemailer + unenv`     | 382.0 kB            | 93.9 kB   | Server SMTP Lead Delivery         | Strictly scoped to server runtime                |
| `supabase__auth-js`      | 320.6 kB            | 65.1 kB   | Admin Authentication & JWT Tokens | Server runtime only; excluded from client bundle |
| `articles-ipq00Q3K.mjs`  | 56.8 kB             | 18.8 kB   | Evergreen Article Content Dataset | Modular import, server-rendered                  |
| `courseRoadmaps.mjs`     | 60.8 kB             | 17.7 kB   | 32 Course Chapter Curricula       | Split by course slug at runtime                  |
| `zod`                    | 100.1 kB            | 17.3 kB   | Form & Lead Validation Schemas    | Shared utility                                   |
| `tailwind-merge`         | 85.6 kB             | 15.2 kB   | Dynamic Class Resolution          | Minified in production                           |

---

## 3. LCP Elements & Loading Strategy for Priority Routes

1. **Homepage (`/`)**:
   - **LCP Element**: Hero H1 headline text (`Build Real Technical Skills...`).
   - **Optimization**: Zero render-blocking remote fonts; Google Fonts preconnected with `display=swap`. Background grid and glows rendered purely via CSS gradients without blocking image downloads.

2. **Courses Catalog (`/courses`)**:
   - **LCP Element**: CatalogHero H1 title container (`32 Hands-On Technical Courses`).
   - **Optimization**: Pre-rendered via SSR. Initial 12 course cards rendered immediately; remaining filtered via lightweight React state.

3. **Course Detail (`/courses/python`)**:
   - **LCP Element**: Course Header H1 and scannable credential strip.
   - **Optimization**: Above-the-fold layout uses SVG vector badges. Course chapter accordions mount lazily on interaction.

4. **Specialization Detail (`/specializations/full-stack-developer`)**:
   - **LCP Element**: Specialization Hero H1 and pricing callout box (`PKR 20,000/month`).
   - **Optimization**: Static SSR rendering with zero hydration delay.

5. **Resource Article (`/blog/python-learning-roadmap-beginners`)**:
   - **LCP Element**: Article H1 heading and author/metadata lead strip.
   - **Optimization**: Fast text-based hero; table of contents rendered synchronously without dynamic client queries.

---

## 4. Responsive Viewport Audit Matrix

Tested via Chromium headless across seven standard device viewports:

| Viewport Profile     | Width  | Height | Device Class        | Horizontal Overflow | Result  |
| :------------------- | :----- | :----- | :------------------ | :------------------ | :------ |
| **Mobile Compact**   | 375px  | 667px  | iPhone SE           | 0px                 | ✅ PASS |
| **Mobile Standard**  | 390px  | 844px  | iPhone 12/13/14     | 0px                 | ✅ PASS |
| **Mobile Large**     | 430px  | 932px  | iPhone 14 Pro Max   | 0px                 | ✅ PASS |
| **Tablet Portrait**  | 768px  | 1024px | iPad Mini           | 0px                 | ✅ PASS |
| **Tablet Landscape** | 1024px | 768px  | iPad / Small Laptop | 0px                 | ✅ PASS |
| **Desktop Standard** | 1280px | 800px  | Standard Laptop     | 0px                 | ✅ PASS |
| **Desktop Wide**     | 1440px | 900px  | High-Res Monitor    | 0px                 | ✅ PASS |

---

## 5. Accessibility & Media Optimization

1. **Image Dimensions & Attributes**:
   - Every public image provides an explicit or inferred aspect ratio.
   - 100% of meaningful images contain descriptive `alt` text. Decorative badges use empty `alt=""` or `aria-hidden="true"`.
2. **Keyboard Navigation & Focus**:
   - Accessible skip link (`#main-content`) is anchored at the very beginning of the DOM.
   - All interactive modal triggers, buttons, and form inputs retain visible focus rings.
3. **Reduced Motion**:
   - Staggered entrance animations respect `prefers-reduced-motion: reduce`. Content remains 100% visible and readable with motion disabled.

---

## 6. Honest Limitations & Operational Recommendations

- **Font Preconnection**: Inter and Plus Jakarta Sans are served via Google Fonts CDN. If self-hosting fonts in a future phase, subresource latency could be reduced by a further 50ms.
- **Client Hydration**: Because TanStack Start delivers full SSR, client-side rehydration is fast. Avoiding heavy third-party tracking scripts beyond the existing Meta Pixel preserves this clean performance baseline.
