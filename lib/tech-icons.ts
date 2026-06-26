import { readFile } from "fs/promises";
import path from "path";

/** Display color for carousel icons. */
export const TECH_ICON_COLOR = "#319860";

const ICON_DIR = path.join(process.cwd(), "public/icons/tech");

/**
 * Carousel tech list.
 * - `file` must match `public/icons/tech/{file}.svg`
 * - `name` is the label shown under the icon
 *
 * To add a tech: drop an SVG in public/icons/tech/, add one entry here.
 */
export const CAROUSEL_TECHS = [
  { file: "javascript", name: "javascript" },
  { file: "typescript", name: "typescript" },
  { file: "react", name: "react" },
  { file: "nextdotjs", name: "nextjs" },
  { file: "sass", name: "sass" },
  { file: "tailwindcss", name: "tailwind" },
  { file: "figma", name: "figma" },
  { file: "git", name: "git" },
  { file: "gulp", name: "gulp" },
  { file: "vite", name: "vite" },
  { file: "pug", name: "pug" },
  { file: "webpack", name: "webpack" },
  { file: "npm", name: "npm" },
] as const;

export type CarouselTech = {
  name: string;
  src: string;
};

function tintSvg(svg: string, color: string) {
  return svg
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/\sfill="[^"]*"/g, "")
    .replace(/<path /g, `<path fill="${color}" `);
}

function toDataUrl(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function loadCarouselTechIcons(): Promise<CarouselTech[]> {
  return Promise.all(
    CAROUSEL_TECHS.map(async ({ file, name }) => {
      const raw = await readFile(path.join(ICON_DIR, `${file}.svg`), "utf8");
      return { name, src: toDataUrl(tintSvg(raw, TECH_ICON_COLOR)) };
    })
  );
}
