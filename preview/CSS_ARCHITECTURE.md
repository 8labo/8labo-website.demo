# 8LABO Website CSS Architecture

Updated: 2026-09-01

## Goal

Prevent a local visual adjustment on one page from changing unrelated pages.

## Ownership

### Home
- Entry point: `home-refactor.css`
- Home layout / spacing / typography: `home-p051-base.css`
- Do not import secondary-page wrapping rules here.

### Academy
- Entry point: `p020-academy.css`
- Academy baseline: `academy-p050-base.css` -> `academy-refactor.css`
- Preserve `ACADEMY_STABLE_SPEC.md` as the visual baseline.
- Do not import secondary-page wrapping rules here.

### Secondary pages
- Entry point: `subpages.css`
- Base: `subpages-p049-base.css`
- Typography: `subpages-typography-p067.css`
- Heading label contract: `subpages-label-contract-p069.css`
- Japanese wrapping: `subpages-japanese-wrap-p085.css`
- Secondary-page wrapping rules must be scoped to `body.p003.subpage`.

### About-only
- Profile layout: `about-profile-layout-p084.css`
- Reading rhythm: `about-reading-p085.css`
- About-only files must use `.about-page` scope.

### Shared shell
- Shared consistency: `p051-consistency.css`
- Mobile header: `mobile-header.css`
- Canonical header: `header-p071.css`

Shared shell files may style header/footer/labels and genuinely universal tokens only. They must not control paragraph widths, page-specific wrapping, hero line breaks, card layout, or section gutters.

## Rules for future edits

1. A request for one page must be implemented inside that page's scope.
2. Never add a new global selector to fix a local visual problem.
3. Never use `body.p003 main p`, `body.p003 main h1`, or similarly broad selectors for a page-specific fix.
4. Avoid new `!important`. Use it only when replacing a legacy declaration that cannot yet be removed, and keep the selector page-scoped.
5. Do not add a new versioned override file for each adjustment. Update the canonical owner file instead.
6. Do not change Home or Academy while fixing About / Adults / Contact.
7. Do not change About / Adults / Contact while fixing Home or Academy.
8. Important line breaks should be expressed by semantic HTML classes/spans in the affected component, not by a site-wide forced wrapping rule.
9. Before deleting a legacy CSS file, confirm it is no longer referenced by any HTML or CSS entry point.
10. Cache busting changes the URL only; it must never be used as a substitute for CSS architecture or specificity fixes.

## Current protection boundary

- Home and Academy keep their pre-P087 wrapping behavior.
- About / Adults / Contact use `subpages-japanese-wrap-p085.css` only.
- `site-japanese-wrap-p086.css` is legacy and must not be imported by any active entry point.
