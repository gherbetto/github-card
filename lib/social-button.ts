export const BUTTON_WIDTH = 180;
export const BUTTON_HEIGHT = 68;
export const BUTTON_MIN_WIDTH = 150;
export const BUTTON_RX = 24;
export const BUTTON_FILL = "#1D2528";
export const BUTTON_LABEL_COLOR = "#c9d1d9";

export type ButtonAnimation = "pulse-ring" | "shimmer" | "none";

export type SocialButtonDef = {
    id: string;              // ?v= value: "email" | "resume" | "portfolio"
    label: string;           // "Email me"
    icon: string;   // inline SVG icon group (16×16 envelope, doc, globe, etc.)
    animation: ButtonAnimation;
};

export const SOCIAL_BUTTONS: SocialButtonDef[] = [
    { id: "email", label: "Email me", icon: "envelope", animation: "shimmer" },
    { id: "portfolio", label: "Portfolio", icon: "globe", animation: "shimmer" },
    { id: "resume", label: "Resume", icon: "file", animation: "shimmer" },
];