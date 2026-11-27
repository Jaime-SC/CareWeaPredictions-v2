/**
 * Runs the offline engine verifications (no DB writes, no paid API calls).
 * Usage: npm run verify
 */
import { spawnSync } from "node:child_process";

const OFFLINE = [
  "run-backtest-compare", "verify-allowed-leagues", "verify-auto-tuner", "verify-auto-tuning",
  "verify-backtest", "verify-concacaf-origin", "verify-conmebol-origin", "verify-contrast", "verify-context-engine",
  "verify-context-rules", "verify-cron-decouple", "verify-diversity", "verify-europe-cup-origin",
  "verify-hybrid-engine", "verify-injuries-checker", "verify-knockout-engine",
  "verify-league-labels-serie-a", "verify-league-labels", "verify-leakage-asof",
  "verify-learning-engine", "verify-leg-count", "verify-monopoly-engine", "verify-parlay-ranking",
  "verify-phase2-markets", "verify-poisson-fair-odds", "verify-poisson", "verify-prediction-scope",
  "verify-pro-metrics", "verify-sa-cup-origin", "verify-season-mapper", "verify-sources",
  "verify-stake-engine", "verify-standings-asof", "verify-team-profile-leakage-asof",
  "verify-team-profiler", "verify-timesfm-engine", "verify-transient-db-retry", "verify-uefa-big5",
  "verify-walkforward-tuning",
];

const failed: string[] = [];
for (const name of OFFLINE) {
  // Single command string: names are static (above), and npx needs a shell on Windows.
  const r = spawnSync(`npx tsx scripts/${name}.ts`, {
    encoding: "utf8",
    shell: true,
    timeout: 120_000,
  });
  const ok = r.status === 0;
  console.log(`${ok ? "✓" : "✗"} ${name}`);
  if (!ok) {
    failed.push(name);
    console.log((r.stderr || r.stdout || "").split("\n").slice(-8).join("\n"));
  }
}

console.log(`\n${OFFLINE.length - failed.length}/${OFFLINE.length} passed`);
if (failed.length > 0) process.exit(1);
