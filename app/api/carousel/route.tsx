import satori from "satori";
import { readFile } from "fs/promises";
import path from "path";
import {
  loadCarouselTechIcons,
  TECH_ICON_COLOR,
  type CarouselTech,
} from "@/lib/tech-icons";

export const runtime = "nodejs";

const CARD_WIDTH = 860;
const CARD_HEIGHT = 80;
const ICON_SIZE = 28;
const ITEM_WIDTH = 84;
const FADE_WIDTH = 80;
const BG = "#1D2528";
const BORDER = "#21262d";
const RADIUS = 12;

/** Static strip — Satori handles layout, fonts, and images. */
function TrackStrip({ items }: { items: CarouselTech[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: CARD_HEIGHT,
      }}
    >
      {items.map((tech, i) => (
        <div
          key={`${tech.name}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              padding: "0 28px",
              width: ITEM_WIDTH,
            }}
          >
            <img
              src={tech.src}
              width={ICON_SIZE}
              height={ICON_SIZE}
              alt=""
            />
            <span
              style={{
                fontFamily: "DMMono",
                fontSize: 12,
                color: "#c9d1d9",
                textTransform: "lowercase",
              }}
            >
              {tech.name}
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 20,
              background: BORDER,
              flexShrink: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function wrapAnimatedCard(
  innerSvg: string,  // already stripped of outer <svg> tags
  trackWidth: number,
  techCount: number
) {
  const durationSec = Math.max(28, techCount * 2.5);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <clipPath id="card-clip">
      <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="${RADIUS}" ry="${RADIUS}" />
    </clipPath>
    <linearGradient id="fade-left" gradientUnits="objectBoundingBox" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${BG}" />
      <stop offset="100%" stop-color="${BG}" stop-opacity="0" />
    </linearGradient>
    <linearGradient id="fade-right" gradientUnits="objectBoundingBox" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="${BG}" />
      <stop offset="100%" stop-color="${BG}" stop-opacity="0" />
    </linearGradient>
  </defs>

  <g clip-path="url(#card-clip)">
    <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${BG}" />

    <g>
      <animateTransform
        attributeName="transform"
        type="translate"
        from="0 0"
        to="-${trackWidth} 0"
        dur="${durationSec}s"
        repeatCount="indefinite"
      />
      ${innerSvg}
    </g>

    <rect x="0" y="0" width="${FADE_WIDTH}" height="${CARD_HEIGHT}" fill="url(#fade-left)" />
    <rect x="${CARD_WIDTH - FADE_WIDTH}" y="0" width="${FADE_WIDTH}" height="${CARD_HEIGHT}" fill="url(#fade-right)" />
  </g>

  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" rx="${RADIUS}" ry="${RADIUS}" fill="none" stroke="${BORDER}" stroke-width="1" />
</svg>`;
}

export async function GET() {
  const [dmMono, techs] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/DMMono-Regular.ttf")),
    loadCarouselTechIcons(),
  ]);

  const items = [...techs, ...techs];
  const loopWidth = techs.length * ITEM_WIDTH;  // renamed for clarity

  const stripSvg = await satori(<TrackStrip items={items} />, {
    width: loopWidth * 2,
    height: CARD_HEIGHT,
    fonts: [{ name: "DMMono", data: dmMono, weight: 400 }],
  });

  // Strip the outer <svg>...</svg> wrapper Satori always adds
  const innerSvg = stripSvg
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "");

  const svg = wrapAnimatedCard(innerSvg, loopWidth, techs.length);

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}