# Phase 15: Performance and Core Web Vitals Verification

**Academy**: TechBuilt Open School International Online Academy
**Production Domain**: `https://techbuiltos.online`
**Local Test Harness**: production build served with Vite Preview
**Viewports**: 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px

## Verified in the local production build

The `seo:performance` browser smoke test checks representative commercial, catalog, article, and admissions routes for:

- HTTP 200 responses before evaluating a page;
- horizontal overflow at seven viewport widths;
- image `alt` attributes and non-zero rendered dimensions;
- accessible names on links and buttons;
- the skip-to-content link;
- synthetic CLS observations, with failure above `0.10`;
- synthetic LCP observations, reported as warnings above `2.5s` because local timings are environment-dependent.

This Playwright audit is intentionally not described as Lighthouse. It does not calculate Lighthouse Performance, Accessibility, Best Practices, or SEO category scores.

## Real Lighthouse monitoring

The weekly and manually triggered `seo-health.yml` workflow runs `treosh/lighthouse-ci-action` against five production URLs. Its assertions are configured in `lighthouserc.json`:

| Metric                   | CI threshold | Enforcement |
| ------------------------ | -----------: | ----------- |
| Performance category     |       `0.90` | Warning     |
| Accessibility category   |       `0.90` | Error       |
| Best Practices category  |       `0.90` | Error       |
| SEO category             |       `0.95` | Error       |
| Largest Contentful Paint |    `2,500ms` | Warning     |
| Cumulative Layout Shift  |       `0.10` | Error       |
| Total Blocking Time      |      `300ms` | Warning     |

The first successful production workflow after deployment establishes the real Lighthouse baseline. This report deliberately records no Lighthouse score before that workflow exists and runs.

## Build observations

- The application builds successfully for the Cloudflare Nitro preset.
- The build currently warns that at least one JavaScript chunk exceeds 500 kB after minification. This is a documented optimization opportunity, not a hidden green result.
- Article content is route-split, while shared router and application dependencies remain the largest generated bundles.

## Interpretation limits

- Local synthetic metrics are not Chrome UX Report field data.
- Search Console Core Web Vitals uses real-user data over time and may remain unavailable until traffic is sufficient.
- Lighthouse lab scores can vary between runs; warnings are used for the most variable performance measurements while SEO and structural regressions remain blocking.
