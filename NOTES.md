# Notes during development of the project

## Animation (GitHub README)

- [SMIL](https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/SVG_animation_with_SMIL) inside Satori JSX (hero glow, button shimmer) animates in the browser when opening the API URL directly, but **not** when embedded in a GitHub README `<img>`.
- Carousel works on the README **even via live API URL** because animation is **injected after Satori** — strip the outer `<svg>`, wrap with root-level `<animateTransform>` in `wrapAnimatedCard()`.
- Satori turns JSX layouts into `foreignObject` trees; nested `<svg>` + `<animate>` buried inside often don't run in GitHub's image sandbox. Root-level SMIL survives.
- **Fix for hero/buttons:** same pattern as carousel — render static layout with Satori, then post-process the SVG string to inject animation at the root.

### comparing our animation method vs readme-aura

downloaded both svgs and diffed them.

**our button** (`email-button.svg`):
- shimmer ends up as `<image href="data:image/svg+xml;utf8,...<animateTransform>...">`
- so the animation is trapped *inside* an image payload, not as live svg nodes in the document
- opens fine in browser when you hit the api url directly, but frozen on github readme

**readme-aura button** (`readme-aura-button.svg`):
- animation is a real nested `<svg>` with `<animateTransform>` on the gradient
- no animation buried inside `<image href="data:...">` for the animated part
- that's why it actually moves on the profile

so the issue isn't really "github blocks all animation" — it's **where** the animation ends up in the final svg tree.

### how readme-aura pulls it off

their docs talk about `<style>` + `@keyframes` or SMIL in jsx, but the important part is in `renderer.ts` **after** satori runs:

1. they render with satori like us
2. then they **unpack** any `<image href="data:image/svg+xml;utf8,...">` back into real `<svg>...</svg>` tags (decode uri, pull inner content out)
3. if you used a `<style>` block in jsx, they extract it before satori and inject it into `<defs><style>...</style></defs>` in the final file

satori alone doesn't "run" css animations or guarantee nested svg stays as svg — readme-aura adds that post-process layer. we're missing that step (or the carousel-style root inject).

### two ways to fix hero + buttons

**option A** — steal readme-aura's unpack regex after `satori(...)`. might be enough without rewriting layouts.

**option B** — carousel pattern: satori for static layout only, inject animation at root in a wrapper function. more predictable, already proven in our codebase.

either way it's post-processing. not a hack — readme-aura does it too.

## GitHub README constraints

- Profile README is static — no JS, no API calls on page load. Images are `<img>` tags only.
- Live API URLs can work for display (with caching), but animation reliability depends on **how** the SVG is built, not just where it's hosted.
- GitHub Action (curl APIs → commit `assets/*.svg`) is still useful for **fresh stats** on the hero (WakaTime hours, etc.), not primarily for fixing animation.

## Caching / revalidation

- If a GitHub Action regenerates committed SVGs every 24h, Next.js `revalidate` on the API is still useful — it controls how fresh data is **when the Action hits your endpoints**.
- README reads committed files → API cache headers don't affect profile display. Action schedule = how fresh the profile looks.

## Open questions

- read about string union
