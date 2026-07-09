import satori from "satori";
import { readFile } from "fs/promises";
import path from "path";
import { getGithubUser, getContributions } from "@/lib/github";
import { getAllTimeHours, secondsToHours } from "@/lib/wakatime";
import { stripSatoriWrapper } from "@/lib/svg-utils";

export const runtime = "nodejs";

// ─── constants and style objects ─────────────────────────────────────────────

const pillsStyles = {
  base: {
    display: "flex",
  },
  column: {
    gap: 9,
    flexDirection: "column" as const,
    flexWrap: "nowrap" as const,
    alignItems: "flex-end" as const,
    marginLeft: 40,
  },
  row: {
    gap: 6,
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    marginLeft: 0,
  },
};

// ─── types ───────────────────────────────────────────────────────────────────

type Stats = {
  repos: number;
  followers: number;
  commits: number;
  contributions: number;
  login: string;
  firstName: string;
  lastName: string;
  hoursCoded: number;
};

// ─── post-process wrapper — CSS glow at root (readme-aura pattern) ───────────

function getGlowOffset(isMobile: boolean) {
  return isMobile ? { x: 250, y: -50 } : { x: 650, y: -50 };
}

/** Insert glow after Satori's opaque card fill — not before, or it gets painted over. */
function injectGlowAfterBackground(innerSvg: string, glowLayer: string) {
  const marker = 'fill="#1D2528"';
  const markerIdx = innerSvg.indexOf(marker);
  if (markerIdx === -1) return innerSvg + glowLayer;

  const closeIdx = innerSvg.indexOf("/>", markerIdx);
  if (closeIdx === -1) return innerSvg + glowLayer;

  const insertAt = closeIdx + 2;
  return innerSvg.slice(0, insertAt) + glowLayer + innerSvg.slice(insertAt);
}

function wrapAnimatedHero(
  innerSvg: string,
  opts: { width: number; height: number; isMobile: boolean }
) {
  const { width, height, isMobile } = opts;
  const { x: glowX, y: glowY } = getGlowOffset(isMobile);

  const glowLayer = `
    <g transform="translate(${glowX}, ${glowY})">
      <style>
        @keyframes hero-drift-r {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
          20% { transform: translate(10px, -6px) scale(1.03); opacity: 0.92; }
          45% { transform: translate(24px, -14px) scale(1.07); opacity: 1; }
          70% { transform: translate(14px, 2px) scale(1.04); opacity: 0.9; }
        }
        @keyframes hero-drift-l {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.8; }
          25% { transform: translate(-10px, 5px) scale(1.04); opacity: 0.88; }
          50% { transform: translate(-20px, 12px) scale(1.08); opacity: 1; }
          75% { transform: translate(-8px, -3px) scale(1.03); opacity: 0.86; }
        }
        @keyframes hero-flow {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.85; }
          30% { transform: translate(8px, -10px) scale(1.06); opacity: 0.72; }
          60% { transform: translate(-6px, 6px) scale(1.1); opacity: 0.58; }
        }
        #hero-glow-1 { animation: hero-drift-r 7s cubic-bezier(0.37, 0, 0.63, 1) infinite; }
        #hero-glow-2 { animation: hero-drift-l 8.5s cubic-bezier(0.37, 0, 0.63, 1) infinite 0.2s; }
        #hero-glow-3 { animation: hero-flow 5s cubic-bezier(0.37, 0, 0.63, 1) infinite 0.5s; }
      </style>
      <ellipse id="hero-glow-1" cx="120" cy="120" rx="140" ry="110" fill="url(#hero-g1)" />
      <ellipse id="hero-glow-2" cx="170" cy="135" rx="110" ry="85" fill="url(#hero-g2)" />
      <ellipse id="hero-glow-3" cx="75" cy="105" rx="95" ry="75" fill="url(#hero-g3)" />
    </g>`;

  const layeredInner = injectGlowAfterBackground(innerSvg, glowLayer);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <clipPath id="hero-clip">
      <rect width="${width}" height="${height}" rx="12" ry="12" />
    </clipPath>
    <radialGradient id="hero-g1" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(63,185,80)" stop-opacity="0.50" />
      <stop offset="70%" stop-color="rgb(63,185,80)" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="hero-g2" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(49,152,96)" stop-opacity="0.40" />
      <stop offset="70%" stop-color="rgb(49,152,96)" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="hero-g3" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgb(63,185,80)" stop-opacity="0.3" />
      <stop offset="70%" stop-color="rgb(63,185,80)" stop-opacity="0" />
    </radialGradient>
  </defs>

  <g clip-path="url(#hero-clip)">
    ${layeredInner}
  </g>
</svg>`;
}

// ─── pills — shared helper ────────────────────────────────────────────────────

function Pills({ items, fontSize = 11, direction = "column", }: { items: { text: string; accent: boolean }[]; fontSize?: number; direction?: "row" | "column"; }) {
  return (
    <div
        style={{
          ...pillsStyles.base,
          ...pillsStyles[direction],
        }}
        >
      {items.map((pill) => (
        <div
          key={pill.text}
          style={{
            background: pill.accent ? "#1F302E" : "#161b22",
            border: `1px solid ${pill.accent ? "rgba(49,152,96,0.4)" : "#21262d"}`,
            borderRadius: 20,
            padding: "6px 14px",
            fontSize,
            color: pill.accent ? "#319860" : "#8b949e",
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {pill.text}
        </div>
      ))}
    </div>
  );
}

// ─── layouts ──────────────────────────────────────────────────────────────────

function desktopLayout(stats: Stats) {
  return (
    <div
      style={{
        width: 860,
        height: 270,
        background: "#1D2528",
        border: "1px solid #21262d",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        padding: "40px",
        fontFamily: "DMMono",
        position: "relative",
        overflow: "hidden",
      }}
    >
      

      {/* left */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <span style={{ color: "#319860", fontSize: 12, letterSpacing: "0.07em", marginBottom: 14 }}>
          {`// ${stats.login}.dev`}
        </span>
        <div style={{ display: "flex", marginBottom: 6 }}>
          <span style={{ fontFamily: "ProximaNova", fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 1.05, marginRight: 14 }}>
            {stats.firstName}
          </span>
          <span style={{ fontFamily: "ProximaNova", fontSize: 46, fontWeight: 700, color: "#319860", lineHeight: 1.05 }}>
            {stats.lastName}
          </span>
        </div>
        <span style={{ color: "#8b949e", fontSize: 11, letterSpacing: "0.03em", marginBottom: 15 }}>
          frontend engineer · 3+ yrs exp.
        </span>
        <span style={{ color: "#c9d1d9", fontSize: 12, lineHeight: 1.85, maxWidth: 460}}>
          {"focused on clean foundations and long-term maintainability."}
        </span>
        <span style={{ color: "#c9d1d9", fontSize: 12, lineHeight: 1.85, maxWidth: 460 }}>
          {"30+ production projects shipped — now deepening into React/TS."}
        </span>
      </div>

      {/* right — pills column */}
      <Pills direction="column" items={[
        { text: "🙋‍♂️ open to work", accent: true },
        { text: "📍 Moldova, MD", accent: false },
        { text: `⌛ ${stats.hoursCoded} hrs coded`, accent: false },
        // { text: `👥 ${stats.followers} followers`, accent: false },
        // { text: `📦 ${stats.repos} repos`, accent: false },
      ]} />
      </div>

  );
}

function mobileLayout(stats: Stats) {
  return (
    <div
      style={{
        width: 450,
        height: 270,
        background: "#1D2528",
        border: "1px solid #21262d",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "30px",
        fontFamily: "DMMono",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* left */}
      <div style={{ display: "flex", flexDirection: "column"}}>
        <span style={{ color: "#319860", fontSize: 12, letterSpacing: "0.07em", marginBottom: 10 }}>
          {`// ${stats.login}.dev`}
        </span>
        <div style={{ display: "flex", marginBottom: 4 }}>
          <span style={{ fontFamily: "ProximaNova", fontSize: 35, fontWeight: 700, color: "#fff", lineHeight: 1.05, marginRight: 10 }}>
            {stats.firstName}
          </span>
          <span style={{ fontFamily: "ProximaNova", fontSize: 35, fontWeight: 700, color: "#319860", lineHeight: 1.05 }}>
            {stats.lastName}
          </span>
        </div>
        <span style={{ color: "#8b949e", fontSize: 12, marginBottom: 12 }}>
          frontend engineer · 3+ yrs exp.
        </span>
        <span style={{ color: "#c9d1d9", fontSize: 12, lineHeight: 1.85, maxWidth: 460, marginBottom: 14 }}>
          {"focused on clean foundations and long-term maintainability. 30+ production projects shipped — now deepening into React/TS."}
        </span>
      </div>

      {/* pills wrap into rows on narrow canvas */}
      <Pills direction="row" items={[
        { text: "🙋‍♂️ open to work", accent: true },
        { text: "📍 Moldova", accent: false },
        { text: `⌛ ${stats.hoursCoded} hrs coded`, accent: false },
        // { text: `👥 ${stats.followers}`, accent: false },
        // { text: `📦 ${stats.repos}`, accent: false },
      ]} />
    </div>
  );
}

// ─── route ────────────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const isMobile = searchParams.get("v") === "mobile";

  const width = isMobile ? 450 : 860;
  const height = isMobile ? 270 : 270;

  // load fonts and github data at the same time
  const [dmMono, proximaNovaRegular , proximaNovaBold, user, contributions,allTimeHours] = await Promise.all([
    readFile(path.join(process.cwd(), "public/fonts/DMMono-Regular.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/ProximaNova-Regular.ttf")),
    readFile(path.join(process.cwd(), "public/fonts/ProximaNova-Bold.ttf")),
    getGithubUser(),
    getContributions(),
    getAllTimeHours(),
  ]);

  const [firstName, lastName] = (user.name as string).split(" ");

  // pull out the numbers we need
   const stats: Stats = {
    repos: user.public_repos,
    followers: user.followers,
    commits: contributions.contributionsCollection.totalCommitContributions,
    contributions: contributions.contributionCalendar.totalContributions,
    login: user.login,
    firstName,
    lastName,
    hoursCoded: secondsToHours(allTimeHours.total_seconds),
  };

  const rawSvg = await satori(
    isMobile ? mobileLayout(stats) : desktopLayout(stats),
    {
      width,
      height,
      fonts: [
        { name: "ProximaNova", data: proximaNovaRegular, weight: 400 },
        { name: "ProximaNova", data: proximaNovaBold, weight: 700 },
        { name: "DMMono", data: dmMono, weight: 400 },
      ],
      loadAdditionalAsset: async (code, segment) => {
        if (code === "emoji") {
          const codePoint = [...segment]
            .map((c) => c.codePointAt(0)!.toString(16))
            .join("-")
          const url = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codePoint}.svg`
          const res = await fetch(url)
          const text = await res.text()
          return `data:image/svg+xml;base64,${Buffer.from(text).toString("base64")}`
        }
        return ""
      },
    }
  );

  const innerSvg = stripSatoriWrapper(rawSvg);
  const svg = wrapAnimatedHero(innerSvg, { width, height, isMobile });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}