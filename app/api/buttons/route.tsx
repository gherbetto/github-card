import satori from "satori";
import { readFile } from "fs/promises";
import path from "path";
import {
  BUTTON_RX,
  SocialButtonDef,
  SOCIAL_BUTTONS,
  BUTTON_WIDTH,
  BUTTON_HEIGHT,
  BUTTON_MIN_WIDTH,
  BUTTON_FILL,
  BUTTON_LABEL_COLOR,
} from "@/lib/social-button";
import { stripSatoriWrapper } from "@/lib/svg-utils";

// ─── static button — Satori draws icon + label only ───────────────────────────
// Background and shimmer are injected after Satori (carousel pattern).
// If we let Satori draw the pill bg, shimmer would sit behind an opaque layer and vanish.

function SocialButtonStatic({ button }: { button: SocialButtonDef }) {
  return (
    <div
      style={{
        fontSize: 12,
        color: BUTTON_LABEL_COLOR,
        whiteSpace: "nowrap",
        display: "flex",
        gap: 6,
        padding: "16px 28px",
        alignItems: "center",
        justifyContent: "center",
        minWidth: BUTTON_MIN_WIDTH,
      }}
    >
      <ButtonIcon name={button.icon} />
      {button.label}
    </div>
  );
}

function ButtonSlot({ button }: { button: SocialButtonDef }) {
  return (
    <div
      style={{
        width: BUTTON_WIDTH,
        height: BUTTON_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <SocialButtonStatic button={button} />
    </div>
  );
}

// ─── post-process wrapper — real SMIL at root level ─────────────────────────

function getPillGeometry() {
  const pillW = BUTTON_MIN_WIDTH;
  const pillH = BUTTON_HEIGHT - 20; // 68 - 10px inset top/bottom
  const pillX = (BUTTON_WIDTH - pillW) / 2;
  const pillY = (BUTTON_HEIGHT - pillH) / 2;
  return { pillX, pillY, pillW, pillH };
}

function wrapAnimatedButton(
  innerSvg: string,
  opts: { width: number; height: number; shimmer: boolean }
) {
  const { width, height, shimmer } = opts;
  const { pillX, pillY, pillW, pillH } = getPillGeometry();

  const shimmerLayer = shimmer
    ? `
    <g clip-path="url(#pill-clip)">
      <g transform="translate(${pillX}, ${pillY})">
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            from="-60 0"
            to="220 0"
            dur="3s"
            repeatCount="indefinite"
          />
          <rect
            x="0"
            y="-10"
            width="50"
            height="80"
            fill="url(#shimmer-grad)"
            transform="rotate(-20)"
          />
        </g>
      </g>
    </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <clipPath id="pill-clip">
      <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${BUTTON_RX}" />
    </clipPath>
    <linearGradient id="shimmer-grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgb(63, 185, 80)" stop-opacity="0" />
      <stop offset="50%" stop-color="rgb(63, 185, 80)" stop-opacity="0.2" />
      <stop offset="100%" stop-color="rgb(63, 185, 80)" stop-opacity="0" />
    </linearGradient>
  </defs>

  <rect x="${pillX}" y="${pillY}" width="${pillW}" height="${pillH}" rx="${BUTTON_RX}" fill="${BUTTON_FILL}" />

  ${shimmerLayer}

  ${innerSvg}
</svg>`;
}

// ─── button icons ────────────────────────────────────────────────────────────

function ButtonIcon({ name }: { name: string }) {
  if (name === "envelope") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
      </svg>
    );
  }
  if (name === "globe") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z" />
      </svg>
    );
  }
  if (name === "file") {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" fill="currentColor">
        <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5M5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1z" />
        <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1" />
      </svg>
    );
  }
  return null;
}

// ─── main route ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const buttonId = searchParams.get("buttonId");

  const button = SOCIAL_BUTTONS.find((button) => button.id === buttonId);
  if (!button) {
    return new Response("Button not found", { status: 404 });
  }

  const [dmMono] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/DMMono-Regular.ttf")),
  ]);

  const rawSvg = await satori(<ButtonSlot button={button} />, {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    fonts: [{ name: "DMMono", data: dmMono, weight: 400 }],
  });

  const innerSvg = stripSatoriWrapper(rawSvg);
  const svg = wrapAnimatedButton(innerSvg, {
    width: BUTTON_WIDTH,
    height: BUTTON_HEIGHT,
    shimmer: button.animation === "shimmer",
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
