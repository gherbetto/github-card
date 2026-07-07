# Notes during development of the project

## Animation (GitHub README)

- [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_animation_with_SMIL) inside Satori JSX (hero glow, button shimmer) animates in the browser when opening the API URL directly, but **not** when embedded in a GitHub README `<img>`.
- Carousel works on the README **even via live API URL** because animation is **injected after Satori** — strip the outer `<svg>`, wrap with root-level `<animateTransform>` in `wrapAnimatedCard()`.
- Satori turns JSX layouts into `foreignObject` trees; nested `<svg>` + `<animate>` buried inside often don't run in GitHub's image sandbox. Root-level SMIL survives.
- **Fix for hero/buttons:** same pattern as carousel — render static layout with Satori, then post-process the SVG string to inject animation at the root.

## GitHub README constraints

- Profile README is static — no JS, no API calls on page load. Images are `<img>` tags only.
- Live API URLs can work for display (with caching), but animation reliability depends on **how** the SVG is built, not just where it's hosted.
- GitHub Action (curl APIs → commit `assets/*.svg`) is still useful for **fresh stats** on the hero (WakaTime hours, etc.), not primarily for fixing animation.

## Caching / revalidation

- If a GitHub Action regenerates committed SVGs every 24h, Next.js `revalidate` on the API is still useful — it controls how fresh data is **when the Action hits your endpoints**.
- README reads committed files → API cache headers don't affect profile display. Action schedule = how fresh the profile looks.

## Open questions

- read about string union
