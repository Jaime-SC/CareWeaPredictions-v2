/**
 * WCAG contrast check for the design tokens in app/globals.css (both themes).
 * Reads hex values straight from the CSS so docs/PLAN.md's contrast table can't drift.
 * Usage: npx tsx scripts/verify-contrast.ts
 */
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

function block(selector: RegExp): Record<string, string> {
  const start = css.search(selector);
  if (start < 0) throw new Error(`missing ${selector} block`);
  const body = css.slice(start, css.indexOf("}", start));
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
}

const dark = block(/^:root,\s*\.dark\s*\{/m);
const themes = { dark, light: { ...dark, ...block(/^\.light\s*\{/m) } };

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lum = (hex: string) => {
  const [r, g, b] = rgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// Same blend as `color-mix(in srgb, <fg> 14%, <bg>)` used by the status badges.
const mix = (fg: string, bg: string, p: number) =>
  "#" + rgb(fg).map((v, i) => Math.round(v * p + rgb(bg)[i] * (1 - p)).toString(16).padStart(2, "0")).join("");

const STATUS = ["won", "lost", "pending", "void", "value", "risk"];
type Pair = [fg: string, bg: string, min: number];
const pairs: Pair[] = [
  ["foreground", "background", 4.5],
  ["foreground", "card", 4.5],
  ["foreground", "muted", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["ring", "background", 3],
  ["ring", "card", 3],
  ...STATUS.flatMap((s): Pair[] => [
    [s, "background", 4.5],
    [s, "card", 4.5],
    [s, `${s}@tint`, 4.5],
  ]),
];

let failed = 0;
for (const [name, t] of Object.entries(themes)) {
  console.log(`\n${name}`);
  for (const [fg, bg, min] of pairs) {
    const fgHex = t[fg];
    const bgHex = bg.endsWith("@tint") ? mix(t[fg], t.card, 0.14) : t[bg];
    if (!fgHex || !bgHex) throw new Error(`${name}: token --${fg} or --${bg} has no hex value`);
    const r = ratio(fgHex, bgHex);
    const ok = r >= min;
    if (!ok) failed++;
    console.log(`${ok ? "✓" : "✗"} ${fg} ${fgHex} on ${bg} ${bgHex}: ${r.toFixed(2)} (min ${min})`);
  }
}

// Brand rules from docs/PLAN.md: the CTA red must stay unreadable on #1B4532 (guard against palette edits).
console.assert(ratio("#ee4129", "#1b4532") < 3, "#EE4129 on #1B4532 unexpectedly passes");

if (failed) {
  console.log(`\n${failed} pair(s) below WCAG AA`);
  process.exit(1);
}
console.log("\nall pairs pass");
