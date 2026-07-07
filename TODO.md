# Todos

## tomorrow — animation fix (priority)

- [ ] Hero: remove `AnimatedGlow` from Satori JSX; add `wrapAnimatedGlow()` post-process (mirror carousel pattern)
- [ ] Buttons: remove `ShimmerLayer` from Satori JSX; inject shimmer `<animateTransform>` at root after Satori
- [ ] Verify all three cards animate on GitHub profile README (hero, carousel, buttons via API URLs)
- [ ] Compare raw SVG source: confirm `<animate>` / `<animateTransform>` sit at root, outside `foreignObject`

## tomorrow — if animation is done

- [ ] Wire buttons into profile README (`<a><img src=".../api/buttons?buttonId=email">` etc.)
- [ ] Quick smoke test: mobile hero variant (`?v=mobile`) on profile if used

## later

- [ ] GitHub Action: curl `/api/hero` (and optionally carousel) → `assets/` → commit on schedule (daily)
- [ ] Repo README: short "how it works" + architecture (Satori → post-inject SMIL → profile)
- [ ] One-liner on profile README linking to this repo

## done

- [x] Social buttons (email, resume, portfolio)
- [x] Tech carousel with infinite scroll animation

## dropped

- ~~Most used languages card~~ — doesn't fit the story right now
