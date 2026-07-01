import satori from "satori";
import { readFile } from "fs/promises";
import path from "path";
import { getGithubUser, getContributions } from "@/lib/github";
import { getAllTimeHours, secondsToHours } from "@/lib/wakatime";

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

// ─── animated glow — shared between both layouts ──────────────────────────────

function AnimatedGlow() {
  return (
    <svg
      style={{ position: "absolute", top: -120, right: -100, overflow: "visible" }}
      width="300"
      height="300"
    >
      <defs>
        <radialGradient id="glow1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(63,185,80,0.18)" />
          <stop offset="70%" stopColor="rgba(63,185,80,0)" />
        </radialGradient>
        <radialGradient id="glow2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(63,185,80,0.08)" />
          <stop offset="70%" stopColor="rgba(63,185,80,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="150" rx="140" ry="140" fill="url(#glow2)">
        <animate attributeName="rx" values="130;150;130" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
        <animate attributeName="ry" values="130;150;130" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
        <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
      </ellipse>
      <ellipse cx="150" cy="150" rx="80" ry="80" fill="url(#glow1)">
        <animate attributeName="rx" values="80;95;80" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
        <animate attributeName="ry" values="80;95;80" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1" />
      </ellipse>
    </svg>
  );
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
            background: pill.accent ? "rgba(49,152,96,0.1)" : "#161b22",
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
      <AnimatedGlow />

      {/* bottom divider */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: 2,
          background: "linear-gradient(90deg, transparent, rgba(63,185,80,0.3), transparent)",
        }}
      />

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
      <AnimatedGlow />

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

  const svg = await satori(
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

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}