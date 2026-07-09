# Todos

## done today — buttons animation

### shared helper

- [x] Add `lib/svg-utils.ts` with `stripSatoriWrapper(svg)` — strip outer `<svg>` tags (same regex as carousel)

### button route edits

- [x] Split `SocialButton` → `SocialButtonStatic` (icon + label only, no bg / no shimmer jsx)
- [x] Delete `ShimmerLayer` component from `app/api/buttons/route.tsx`
- [x] Add `wrapAnimatedButton(innerSvg, { width, height, shimmer })` — pill bg + clip + root-level shimmer SMIL + inner content
- [x] Wire route: `satori` → `stripSatoriWrapper` → `wrapAnimatedButton` → return (use `button.animation === "shimmer"`)

### verify buttons

- [ ] `curl /api/buttons?buttonId=email` → save svg, confirm no `data:image/svg+xml` around `<animateTransform>`
- [ ] Confirm `<animateTransform>` sits at root level in final output
- [ ] Test on GitHub profile README — email button shimmer should move

## next — hero animation

- [ ] Remove `AnimatedGlow` from desktop + mobile layouts
- [ ] Add `wrapAnimatedHero(innerSvg, width, height)` — inject glow ellipses + `<animate>` at root (mirror carousel)
- [ ] Wire route: `satori` → `stripSatoriWrapper` → `wrapAnimatedHero` → return
- [ ] Verify hero svg + README

## next — if animation is done

- [ ] Wire buttons into profile README (`<a><img src=".../api/buttons?buttonId=email">` etc.)

## later

- [ ] GitHub Action: curl `/api/hero` (and optionally carousel) → `assets/` → commit on schedule (daily)
- [ ] Repo README: short "how it works" + architecture (Satori → post-inject SMIL → profile)
- [ ] One-liner on profile README linking to this repo

## done

- [x] Social buttons (email, resume, portfolio)
- [x] Tech carousel with infinite scroll animation
- [x] Button route switched to carousel-style post-processing (`stripSatoriWrapper` + `wrapAnimatedButton`)

## dropped

- ~~Most used languages card~~ — doesn't fit the story right now
