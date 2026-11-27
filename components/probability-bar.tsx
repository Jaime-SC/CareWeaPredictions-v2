"use client";

import { motion } from "motion/react";
import { transition } from "@/components/motion/tokens";
import { cn } from "@/lib/utils";

const pct = new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 1 });
const signedPct = new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 1, signDisplay: "always" });

/**
 * Model probability against the probability the odds imply. The value is the gap,
 * so the gap is what gets drawn: fill to the model, a tick at the market, the
 * stretch between them tinted `value` (or `risk` when the market is ahead).
 */
export function ProbabilityBar({ model, odds, className }: { model: number; odds: number; className?: string }) {
  // The API can report no real odds (0/NaN); 1 / odds would draw an infinite bar.
  if (!(odds > 1) || !(model >= 0 && model <= 1)) return null;
  const implied = 1 / odds;
  const ev = model * odds - 1;
  const ahead = model >= implied;
  const [lo, hi] = ahead ? [implied, model] : [model, implied];

  return (
    <div
      role="meter"
      aria-label="Probabilidad del modelo frente a la cuota"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(model * 1000) / 10}
      aria-valuetext={`Modelo ${pct.format(model)}, la cuota implica ${pct.format(implied)}, value ${signedPct.format(ev)}`}
      className={cn("rounded-2xl border bg-card p-5", className)}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Modelo</p>
          <p className="font-display text-display leading-none">{pct.format(model)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">La cuota {odds.toLocaleString("es-CL")} implica</p>
          <p className="font-mono text-2xl tabular-nums">{pct.format(implied)}</p>
        </div>
      </div>

      <div aria-hidden="true" className="relative mt-6 h-3 rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 origin-left rounded-full bg-foreground/25"
          style={{ width: `${model * 100}%` }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={transition.slow}
        />
        <motion.div
          className={cn("absolute inset-y-0 origin-left rounded-full", ahead ? "bg-value" : "bg-risk")}
          style={{ left: `${lo * 100}%`, width: `${(hi - lo) * 100}%` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...transition.base, delay: 0.3 }}
        />
        <span className="absolute -inset-y-1.5 w-0.5 -translate-x-1/2 rounded-full bg-foreground" style={{ left: `${implied * 100}%` }} />
      </div>

      <p className={cn("mt-4 font-mono text-sm tabular-nums", ahead ? "text-value" : "text-risk")}>
        Value {signedPct.format(ev)}
      </p>
    </div>
  );
}
