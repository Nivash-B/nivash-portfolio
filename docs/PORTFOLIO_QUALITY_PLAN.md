# Portfolio Quality Plan

## TL;DR / Mental model

Keep the existing portfolio design and behavior while making its measurable quality gates pass at 100: Performance, Accessibility, Best Practices, SEO, responsive layout, and cross-browser interactions.

## Overview

This is a technical quality pass over the existing static portfolio. Success means 100 in all four Lighthouse categories on mobile and desktop, plus clean representative interaction checks across Chromium, Edge, Firefox, and WebKit.

## Goals and non-goals

- Goal: achieve repeatable Lighthouse 100 scores on the local production assets.
- Goal: preserve the approved design, copy, animations, and contact flow.
- Goal: keep all fonts and application assets local.
- Non-goal: redesign sections or add backend services.
- Non-goal: claim that subjective visual taste or every future physical device can be numerically guaranteed.

## Scope

- v1: loading priority, responsive behavior, accessibility, metadata, browser scrolling, and runtime cleanliness.
- v2 / later: analytics or backend monitoring, only if explicitly requested.
- Out: content redesign, data storage, authentication, and third-party runtime dependencies.

## Decisions summary

- Reuse the current static HTML/CSS/JavaScript architecture.
- Preload only the three local fonts required by the above-the-fold hero.
- Give the desktop hero image an explicit high fetch priority.
- Keep section geometry stable across engines; retain native image lazy loading instead of section-level paint skipping.
- Preserve native browser wheel/touch momentum and existing responsive UI.

## Reuse map

| Feature need | Existing pattern/helper | Evidence |
|---|---|---|
| Local font delivery | Existing `@font-face` assets | `styles.css` font declarations |
| Responsive layout | Existing mobile media queries | `styles.css` responsive rules |
| Cross-browser interactions | Existing menu, scroll, dialog controllers | `script.js` |
| SEO and accessibility | Existing metadata and semantic markup | `index.html` head and landmarks |

## Data model and migrations

No data model or migration is needed because the portfolio is static.

## Backend design

No backend or API changes are needed.

## Frontend design

- Discover critical local fonts directly from the document instead of waiting for CSS discovery.
- Prioritize the above-the-fold hero logo without changing image selection or dimensions.
- Keep source and deployed minified assets aligned.

## Permissions, security, and audit

No new permissions, cookies, third-party requests, or user-data handling are introduced.

## Edge cases

- Preloaded fonts must match the exact `@font-face` URLs and include `crossorigin`.
- Loading changes must not create console warnings, layout shifts, overflow, or broken interactions.
- Mobile and desktop scores must both be measured from clean Lighthouse runs.

## Test plan

- Run Lighthouse mobile and desktop across all four scored categories.
- Verify FCP, LCP, TBT, CLS, and Speed Index.
- Run browser smoke checks for loading, scrolling, overflow, dialog interaction, and console cleanliness.
- Run syntax and diff checks before commit.

## Gap matrix

| Plan item | Implemented? | Evidence | Gap | Action |
|---|---:|---|---|---|
| Performance 100 | Yes | Mobile and desktop Lighthouse reports | None | Preloaded critical local fonts and prioritized hero image |
| Accessibility 100 | Yes | Mobile and desktop Lighthouse reports | None | Retained semantic and accessible controls |
| Best Practices 100 | Yes | Mobile and desktop Lighthouse reports | None | No further action |
| SEO 100 | Yes | Mobile and desktop Lighthouse reports | None | Retained metadata and structured data |
| Responsive/browser behavior | Yes | Cross-browser regression matrix and final smoke tests | None | Removed unstable section geometry skipping while retaining image lazy loading |

## Implementation checklist

- [x] Establish mobile and desktop baselines.
- [x] Identify the remaining performance dependency chain.
- [x] Add targeted local font and hero image priorities.
- [x] Verify mobile Lighthouse 100/100/100/100.
- [x] Verify desktop Lighthouse 100/100/100/100.
- [x] Run final cross-browser smoke tests.

## Open questions

None.
