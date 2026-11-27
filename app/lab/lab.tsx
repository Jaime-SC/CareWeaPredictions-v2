"use client";

import NumberFlow from "@number-flow/react";
import { curveMonotoneX } from "d3-shape";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { useState, useSyncExternalStore } from "react";
import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { Line, LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import AppleActivityCard from "@/components/kokonutui/apple-activity-card";
import BackgroundPaths from "@/components/kokonutui/background-paths";
import SlideToConfirm from "@/components/kokonutui/slide-to-confirm";
import { type IslandTask, StatusIsland } from "@/components/kokonutui/status-island";
import WheelPicker from "@/components/kokonutui/wheel-picker";
import { duration, spring } from "@/components/motion/tokens";
import { ProbabilityBar } from "@/components/probability-bar";
import { StatusBadge, type StatusKind } from "@/components/status-badge";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { ChartLineIcon } from "@/components/ui/chart-line";
import { Dock, DockIcon } from "@/components/ui/dock";
import { GaugeIcon } from "@/components/ui/gauge";
import { HistoryIcon } from "@/components/ui/history";
import { HomeIcon } from "@/components/ui/home";
import { Marquee } from "@/components/ui/marquee";
import { SettingsIcon } from "@/components/ui/settings";
import { Skeleton } from "@/components/ui/skeleton";

/* ── Sample data (static, synthetic) ─────────────────────────────────────── */

const CLP = { style: "currency", currency: "CLP", maximumFractionDigits: 0 } as const;
const clp = new Intl.NumberFormat("es-CL", CLP);
const clpCompact = new Intl.NumberFormat("es-CL", { ...CLP, notation: "compact" });

const BANKROLL_DELTAS = [
  0, 4250, -5000, 3100, 0, -2500, 5600, 2300, -5000, 4700, 1800, -2000, 0, 3900, -5000, 6100, 2200,
  -3000, 4400, 0, -2500, 3300, 5200, -5000, 2900, 1500, -2000, 4800, 3600, -1500,
];
const BANKROLL_START = 500_000;
// Cumulative P&L, not the raw bankroll: a 0-based y axis would flatten a ±5 % swing.
const PNL_SERIES = BANKROLL_DELTAS.reduce<{ date: Date; pnl: number }[]>((acc, delta, i) => {
  acc.push({ date: new Date(Date.UTC(2026, 9, 28 + i)), pnl: (acc.at(-1)?.pnl ?? 0) + delta });
  return acc;
}, []);
const BANKROLL_NOW = BANKROLL_START + PNL_SERIES.at(-1)!.pnl;

// Hit rate next to the rate the odds implied: being right 49 % is a loss if the odds priced 52 %.
const HIT_RATE_BY_MARKET = [
  { mercado: "1X2", acierto: 58, implicito: 54 },
  { mercado: "Doble", acierto: 71, implicito: 68 },
  { mercado: "+2,5", acierto: 54, implicito: 51 },
  { mercado: "Ambos", acierto: 52, implicito: 53 },
  { mercado: "Hándicap", acierto: 49, implicito: 52 },
];

const MATCHES = [
  ["18:00", "Palestino", "Cobresal", "2,10"],
  ["19:30", "Huachipato", "Everton", "2,45"],
  ["20:30", "Colo-Colo", "U. de Chile", "1,85"],
  ["21:00", "River Plate", "Boca Juniors", "2,30"],
  ["16:00", "Arsenal", "Chelsea", "1,95"],
  ["17:15", "Real Madrid", "Sevilla", "1,55"],
  ["14:30", "Inter", "Napoli", "2,20"],
] as const;

const ODDS_TABLE = [
  { mercado: "Gana local", cuota: "1,85", modelo: "57,4 %", value: "+6,2 %" },
  { mercado: "Doble oportunidad 1X", cuota: "1,30", modelo: "80,4 %", value: "+4,5 %" },
  { mercado: "Más de 2,5 goles", cuota: "2,05", modelo: "47,1 %", value: "−3,4 %" },
  { mercado: "Ambos marcan", cuota: "1,90", modelo: "50,2 %", value: "−4,6 %" },
];

const STAKES = [1000, 2000, 3000, 5000, 7500, 10000, 15000, 20000].map((v) => ({
  value: String(v),
  label: clp.format(v),
}));
const DAYS = [
  { value: "hoy", label: "Hoy" },
  { value: "manana", label: "Mañana" },
  { value: "sab", label: "Sáb 28" },
  { value: "dom", label: "Dom 29" },
];

const TYPE_SCALE = [
  ["font-display text-display-lg uppercase", "Display L · 80", "Colo-Colo 2–1"],
  ["font-display text-display uppercase", "Display · 56", "Picks seguros"],
  ["font-display text-display-sm uppercase", "Display S · 40", "Bankroll"],
  ["text-2xl font-semibold", "2XL · 24", "Gana local a 1,85"],
  ["text-lg font-medium", "LG · 18", "Stake sugerido: 1 % del bankroll"],
  ["text-base", "Base · 16", "El modelo ve 57 % y la cuota paga como si fuera 54 %."],
  ["text-sm text-muted-foreground", "SM · 14", "Primera División · Hoy 20:30"],
] as const;

const SWATCHES = [
  ["bg-background", "Fondo"],
  ["bg-card", "Superficie"],
  ["bg-muted", "Muted"],
  ["bg-brand", "Marca #1B4532"],
  ["bg-primary", "CTA accent-strong"],
  ["bg-brand-accent", "Énfasis #EE4129"],
] as const;

const STATUS_KINDS: StatusKind[] = ["won", "lost", "pending", "void", "value", "risk"];

// Stake discipline: 1 % of bankroll is the suggestion, above 2 % the UI warns.
const SUGGESTED_SHARE = 0.01;
const WARN_SHARE = 0.02;

const noop = () => () => {};
/** false during SSR/hydration, true after: theme-dependent UI waits for next-themes. */
const useMounted = () => useSyncExternalStore(noop, () => true, () => false);

/* ── Page ────────────────────────────────────────────────────────────────── */

export function Lab() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const [tasks, setTasks] = useState<IslandTask[]>([
    { id: "quota", label: "Cuota API-Football", detail: "62 de 100 hoy", status: "done" },
  ]);

  const settle = () => {
    const id = `settle-${Date.now()}`;
    setTasks((t) => [...t, { id, label: "Liquidando 3 apuestas", status: "running", progress: 0.35 }]);
    setTimeout(
      () => setTasks((t) => t.map((x) => (x.id === id ? { ...x, status: "done", label: "3 apuestas liquidadas", progress: undefined } : x))),
      2400,
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 md:px-8 md:pt-10">
      <header className="flex flex-wrap items-center justify-between gap-4 pb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase md:text-display">
            Lab <span className="text-muted-foreground">del sistema</span>
          </h1>
          <p className="mt-1 text-sm text-pretty text-muted-foreground">Solo desarrollo · datos de ejemplo, sin conexión a Neon.</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusIsland tasks={tasks} onDismiss={(id) => setTasks((t) => t.filter((x) => x.id !== id))} />
          {mounted ? (
            <AnimatedThemeToggler
              aria-label="Cambiar tema"
              className="grid size-10 place-items-center rounded-full border bg-card text-foreground [&_svg]:size-5"
              theme={resolvedTheme === "light" ? "light" : "dark"}
              onThemeChange={setTheme}
            />
          ) : (
            <span aria-hidden="true" className="size-10 rounded-full border bg-card" />
          )}
        </div>
      </header>

      <PickOfTheDay onSettle={settle} />

      <Section id="tipografia" title="Tipografía" note="Big Shoulders para marcador y cifras grandes, Schibsted Grotesk para la interfaz, Geist Mono con cifras tabulares para cuotas y montos.">
        <ul className="space-y-5">
          {TYPE_SCALE.map(([cls, name, sample]) => (
            <li key={name} className="grid gap-1 md:grid-cols-[10rem_1fr] md:items-baseline md:gap-6">
              <span className="font-mono text-xs text-muted-foreground">{name}</span>
              <span className={`${cls} text-balance`}>{sample}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <caption className="sr-only">Cuotas y value por mercado</caption>
            <thead className="bg-muted text-left text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Mercado</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Cuota</th>
                <th scope="col" className="hidden px-4 py-3 text-right font-medium sm:table-cell">Modelo</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ODDS_TABLE.map((r) => (
                <tr key={r.mercado}>
                  <th scope="row" className="px-4 py-3 text-left font-normal">{r.mercado}</th>
                  <td className="px-4 py-3 text-right font-mono tabular-nums">{r.cuota}</td>
                  <td className="hidden px-4 py-3 text-right font-mono tabular-nums sm:table-cell">{r.modelo}</td>
                  <td className={`px-4 py-3 text-right font-mono tabular-nums ${r.value.startsWith("+") ? "text-value" : "text-muted-foreground"}`}>
                    {r.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="color" title="Color y estados" note="60/30/10 sobre verde cancha. Perdida usa un arcilla apagado: el rojo queda solo para la acción principal y el foco.">
        <div className="grid gap-4 md:grid-cols-2">
          {(["dark", "light"] as const).map((theme) => (
            <div key={theme} className={`${theme} rounded-2xl border bg-background p-5 text-foreground`}>
              <p className="text-sm font-medium">{theme === "dark" ? "Oscuro (por defecto)" : "Claro"}</p>
              <ul className="mt-4 grid grid-cols-3 gap-3">
                {SWATCHES.map(([bg, name]) => (
                  <li key={bg} className="space-y-1.5">
                    <span className={`${bg} block h-12 rounded-lg ring-1 ring-border`} />
                    <span className="block text-xs text-muted-foreground">{name}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex flex-wrap gap-2 rounded-xl bg-card p-3">
                {STATUS_KINDS.map((k) => (
                  <StatusBadge key={k} kind={k} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button size="lg">Registrar apuesta</Button>
          <Button size="lg" variant="secondary">Ver historial</Button>
          <Button size="lg" variant="outline">Filtrar ligas</Button>
          <Button size="lg" variant="ghost">Cancelar</Button>
          <Button size="lg" disabled>Sin value</Button>
        </div>
      </Section>

      <Bankroll />

      <Section id="salud" title="Salud del modelo" note="Cada anillo cuenta apuestas liquidadas contra las que necesita esa métrica para ser confiable. El valor de hoy va al lado: un anillo lleno no significa que el modelo gane, solo que ya se puede juzgar.">
        <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <AppleActivityCard
            title="Muestra liquidada"
            titleAs="h3"
            activities={[
              { label: "CLV", color: "var(--value)", colorEnd: "var(--value)", size: 220, current: 72, target: 100, unit: "apuestas" },
              { label: "Yield", color: "var(--won)", colorEnd: "var(--won)", size: 168, current: 96, target: 150, unit: "apuestas" },
              { label: "Acierto", color: "var(--pending)", colorEnd: "var(--pending)", size: 116, current: 60, target: 60, unit: "apuestas" },
            ]}
          />
          <dl className="grid max-w-md grid-cols-3 gap-4">
            {[
              ["CLV", "+2,1 %", "Aún sin juzgar"],
              ["Yield", "+4,8 %", "Aún sin juzgar"],
              ["Acierto", "58 %", "vs 54 % implícito"],
            ].map(([k, v, note]) => (
              <div key={k}>
                <dt className="text-sm text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-mono text-2xl tabular-nums">{v}</dd>
                <dd className="mt-1 text-xs text-muted-foreground">{note}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      <StakePicker />

      <Section id="partidos" title="Partidos del día" note="Cinta continua; se pausa al pasar el cursor y queda quieta con movimiento reducido.">
        <TickerPause>
        <Marquee pauseOnHover className="[--duration:48s] [--gap:0.75rem]">
          {MATCHES.map(([time, home, away, odds]) => (
            <div key={home} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 text-sm">
              <span className="font-mono tabular-nums text-muted-foreground">{time}</span>
              <span className="font-medium whitespace-nowrap">
                {home} <span className="text-muted-foreground">vs</span> {away}
              </span>
              <span className="font-mono tabular-nums">{odds}</span>
            </div>
          ))}
        </Marquee>
        </TickerPause>
      </Section>

      <Section id="navegacion" title="Navegación" note="Dock con íconos animados (lucide-animated) para escritorio. La barra inferior de Android llega en F2.">
        <Dock className="mt-0" iconMagnification={56}>
          {[
            [HomeIcon, "Inicio"],
            [HistoryIcon, "Historial"],
            [ChartLineIcon, "Stats"],
            [GaugeIcon, "Salud del modelo"],
            [SettingsIcon, "Ajustes"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof HomeIcon;
            return (
              <DockIcon key={label as string} className="group relative">
                <button type="button" aria-label={label as string} className="grid size-11 place-items-center rounded-full">
                  <I size={22} aria-hidden="true" />
                </button>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 rounded-md bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground opacity-0 shadow-raised transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
                >
                  {label as string}
                </span>
              </DockIcon>
            );
          })}
        </Dock>
      </Section>

      <Section id="vacio" title="Vacío y carga" note="Sin picks: fondo vivo y una salida clara. Cargando: esqueletos con la forma del contenido.">
        <div className="grid gap-4 md:grid-cols-2">
          <BackgroundPaths className="min-h-[340px] rounded-2xl border" count={30}>
            <div className="relative max-w-xs px-6 text-center">
              <h3 className="font-display text-display-sm uppercase">Sin picks seguros</h3>
              <p className="mt-2 text-sm text-muted-foreground">Ningún partido de hoy tiene value suficiente. El bankroll se queda quieto.</p>
              <Button className="mt-5" variant="outline">Ver mañana</Button>
            </div>
          </BackgroundPaths>
          <div aria-busy="true" aria-label="Cargando picks" className="space-y-3 rounded-2xl border p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-6 w-14" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      <MotionTokens />
    </main>
  );
}

/* ── Sections ────────────────────────────────────────────────────────────── */

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-title`} className="border-t py-12 md:py-16">
      <div className="mb-8 max-w-2xl">
        <h2 id={`${id}-title`} className="font-display text-display-sm uppercase">
          {title}
        </h2>
        <p className="mt-2 max-w-[65ch] text-pretty text-muted-foreground">{note}</p>
      </div>
      {children}
    </section>
  );
}

function PickOfTheDay({ onSettle }: { onSettle: () => void }) {
  return (
    <section aria-labelledby="pick-title" className="grid gap-4 pb-12 md:grid-cols-[1fr_20rem] md:pb-16">
      <div className="rounded-2xl border bg-card">
        <div className="relative overflow-hidden rounded-[inherit] p-5 md:p-7">
          <BorderBeam size={120} duration={9} colorFrom="var(--brand-accent)" colorTo="var(--pending)" />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <span>Pick del día · Primera División</span>
            <span className="font-mono tabular-nums">Hoy 20:30</span>
          </div>
          <h2 id="pick-title" className="mt-5 font-display text-display uppercase md:text-display-lg">
            Colo-Colo
            <span className="block text-muted-foreground">
              <span className="sr-only">contra </span>U. de Chile
            </span>
          </h2>
          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {[
              ["Mercado", "Gana local"],
              ["Cuota", "1,85"],
              ["Stake", clp.format(5000)],
              ["Riesgo", "Bajo"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs text-muted-foreground">{k}</dt>
                <dd className="mt-1 font-mono text-lg tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusBadge kind="value">Value +6,2 %</StatusBadge>
            <StatusBadge kind="pending">Sin registrar</StatusBadge>
          </div>
          <SlideToConfirm
            className="mt-7 max-w-md"
            label={`Desliza para registrar ${clp.format(5000)}`}
            confirmingLabel="Registrando…"
            doneLabel="Apuesta registrada"
            resetAfter={2500}
            onConfirm={() => new Promise((r) => setTimeout(r, 900)).then(onSettle)}
          />
        </div>
      </div>
      <ProbabilityBar model={0.574} odds={1.85} className="self-start" />
    </section>
  );
}

function Bankroll() {
  const [bankroll, setBankroll] = useState(BANKROLL_NOW);
  const roi = (bankroll - BANKROLL_START) / BANKROLL_START;
  return (
    <Section id="bankroll" title="Bankroll" note="Las cifras cambian con morph de dígitos (Number Flow). En los gráficos el color de estado se reserva: barras neutras, y la comparación la hace la probabilidad implícita.">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <NumberFlow value={bankroll} locales="es-CL" format={CLP} className="font-display text-display-lg leading-none" />
        <p className="pb-2 text-sm text-muted-foreground">
          ROI 30 días{" "}
          <NumberFlow
            value={roi}
            locales="es-CL"
            format={{ style: "percent", maximumFractionDigits: 1, signDisplay: "always" }}
            className={`font-mono tabular-nums ${roi >= 0 ? "text-won" : "text-lost"}`}
          />
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setBankroll((b) => b + 4250)}>
          Simular ganada (+{clp.format(4250)})
        </Button>
        <Button variant="outline" onClick={() => setBankroll((b) => b - 5000)}>
          Simular perdida (−{clp.format(5000)})
        </Button>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <figure className="rounded-2xl border bg-card p-4">
          <figcaption className="text-sm font-medium">Ganancia acumulada (CLP)</figcaption>
          <LineChart data={PNL_SERIES} margin={{ left: 48, right: 8, top: 24, bottom: 32 }}>
            <Grid horizontal />
            {/* monotone: money never overshoots between data points */}
            <Line dataKey="pnl" curve={curveMonotoneX} stroke="var(--chart-line-primary)" />
            <YAxis numTicks={4} formatValue={(v) => clpCompact.format(v)} />
            <XAxis />
            <ChartTooltip />
          </LineChart>
        </figure>
        <figure className="rounded-2xl border bg-card p-4">
          <figcaption className="flex flex-wrap items-center justify-between gap-2 text-sm font-medium">
            Acierto vs. probabilidad implícita (%)
            <span className="flex gap-3 text-xs font-normal text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-foreground/70" />Acierto</span>
              <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-muted-foreground/40" />Implícita</span>
            </span>
          </figcaption>
          <BarChart data={HIT_RATE_BY_MARKET} xDataKey="mercado" margin={{ left: 8, right: 8, top: 24, bottom: 32 }}>
            <Grid horizontal />
            <Bar dataKey="acierto" fill="color-mix(in srgb, var(--foreground) 70%, transparent)" lineCap="round" />
            <Bar dataKey="implicito" fill="color-mix(in srgb, var(--muted-foreground) 40%, transparent)" lineCap="round" />
            <BarXAxis />
            <ChartTooltip />
          </BarChart>
        </figure>
      </div>
    </Section>
  );
}

function StakePicker() {
  const [pick, setPick] = useState<Record<string, string>>({ stake: "5000", dia: "hoy" });
  const stake = Number(pick.stake);
  const suggested = Math.round((BANKROLL_NOW * SUGGESTED_SHARE) / 100) * 100;
  const over = stake > BANKROLL_NOW * WARN_SHARE;
  return (
    <Section id="stake" title="Stake y fecha" note="Rueda táctil para móvil; con teclado se mueve con las flechas. Sobre el 2 % del bankroll, la interfaz frena.">
      <div className="flex flex-wrap items-center gap-6">
        <WheelPicker
          label="Stake y fecha"
          value={pick}
          onValueChange={setPick}
          columns={[
            { id: "stake", label: "Stake", options: STAKES, className: "w-32" },
            { id: "dia", label: "Día", options: DAYS, className: "w-24" },
          ]}
        />
        <div className="space-y-3" aria-live="polite">
          <p className="text-muted-foreground">
            Registrar <span className="font-mono text-foreground tabular-nums">{clp.format(stake)}</span> para{" "}
            <span className="text-foreground">{DAYS.find((d) => d.value === pick.dia)?.label}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Sugerido: <span className="font-mono tabular-nums">{clp.format(suggested)}</span> (1 % del bankroll)
          </p>
          {over && <StatusBadge kind="risk">Sobre el 2 % del bankroll</StatusBadge>}
        </div>
      </div>
    </Section>
  );
}

function MotionTokens() {
  const [on, setOn] = useState(false);
  return (
    <Section id="movimiento" title="Movimiento" note={`Duraciones ${duration.fast * 1000}/${duration.base * 1000}/${duration.slow * 1000} ms con ease-out expo. Con movimiento reducido, Motion quita desplazamientos y deja solo opacidad.`}>
      <div className="space-y-3">
        {(Object.keys(spring) as (keyof typeof spring)[]).map((name) => (
          <div key={name} className="flex items-center gap-4">
            <span className="w-16 font-mono text-xs text-muted-foreground">{name}</span>
            {/* layout animation: MotionConfig reducedMotion="user" turns it into an instant jump */}
            <div className={`flex h-8 flex-1 items-center rounded-full bg-muted px-1 ${on ? "justify-end" : "justify-start"}`}>
              <motion.span layout className="size-6 rounded-full bg-foreground" transition={spring[name]} />
            </div>
          </div>
        ))}
      </div>
      <Button className="mt-5" variant="secondary" onClick={() => setOn((v) => !v)}>
        Reproducir springs
      </Button>
    </Section>
  );
}

/** WCAG 2.2.2: anything that moves for more than 5 s needs a pause control, not just hover. */
function TickerPause({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  return (
    <div className={paused ? "[&_.animate-marquee]:[animation-play-state:paused]" : undefined}>
      {children}
      <Button className="mt-3" variant="ghost" size="sm" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? "Reanudar cinta" : "Pausar cinta"}
      </Button>
    </div>
  );
}
