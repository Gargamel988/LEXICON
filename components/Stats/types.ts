// ── Ortak tipler ───────────────────────────────────────────
export type TabId =
  | "classic"
  | "blitz"
  | "daily"
  | "blind"
  | "multi"
  | "survival"
  | "climb";

export const ACCENTS: Record<TabId, string> = {
  classic: "#82b1ff",
  blitz: "#ff7e79",
  daily: "#4cd964",
  blind: "#FFD54F",
  multi: "#9c27b0",
  survival: "#ff3b30",
  climb: "#CF4C13",
};
