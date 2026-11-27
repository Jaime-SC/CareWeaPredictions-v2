// F0 placeholder — replaced by the real home screen in F3 (docs/PLAN.md).
export default function Home() {
  return (
    <main className="grid min-h-dvh place-items-center p-6">
      <div className="max-w-md space-y-4 text-center">
        <p className="font-mono text-sm tracking-widest text-muted-foreground uppercase">v2 · Fase 0</p>
        <h1 className="text-4xl font-semibold text-balance">
          CareWea<span className="text-brand-accent">Predictions</span>
        </h1>
        <p className="text-muted-foreground">
          Backend operativo. El nuevo frontend se construye siguiendo <code>docs/PLAN.md</code>.
        </p>
      </div>
    </main>
  );
}
