# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Una sola app web (Next.js) usada como PWA en Android (390×844) y en Windows (1440×900); en F8 se
envuelve con Tauri 2 sin cambiar su lenguaje visual.

## Users
- **Primario:** Jaime, único apostador. Abre la app a diario, en el teléfono y en el PC, para ver los
  picks seguros del día, decidir si apuesta, registrar la apuesta y revisar cómo va su bankroll.
- **Secundario:** visitantes del portfolio público (reclutadores, otros devs) que miran la app para
  juzgar el oficio técnico y de diseño. No apuestan.

## Product Purpose
Motor de predicción de fútbol (Poisson / Dixon-Coles + contexto multi-fuente) con gestión de bankroll.
El éxito tiene dos caras:
1. **Disciplina de bankroll:** apostar solo cuando hay value y con el stake correcto; proteger el
   bankroll ante todo.
2. **Mejorar el modelo:** entender calibración, CLV, yield y hit rate para afinar el motor.

## Positioning
No es una casa de apuestas ni un tipster: es un motor propio que muestra su incertidumbre
(probabilidad, value, riesgo) y se audita a sí mismo (calibración, CLV) con el historial liquidado.

## Operating Context
- Sesiones cortas y frecuentes en móvil; sesiones de análisis más largas en escritorio.
- Las cuotas y etiquetas siguen a JugaBet (`lib/jugabet-labels.ts`); la apuesta se hace fuera de la app y
  aquí se registra.
- Datos reales en Neon PostgreSQL compartida con el v1; los crons liquidan resultados.

## Capabilities and Constraints
- **Alcance de producto: solo picks seguros (simples).** Las combinadas quedan fuera del frontend v2
  (decisión 2026-11-26); `/api/parlay` sigue en el backend congelado sin uso en la UI.
- Pantallas previstas: picks seguros, registrar apuesta, historial/bankroll, stats, salud del modelo,
  equipos (ver `docs/PLAN.md`).
- Backend (`app/api/**`, `lib/**`, `prisma/**`) congelado; nada escribe en la BD sin aprobación.
- Cuota de API-Football limitada: el estado de cuota se muestra al usuario.

## Brand Commitments
- Nombre: **CareWeaPredictions**.
- Paleta 60/30/10 fijada en `docs/PLAN.md`: `#1B4532` / `#FFFBFC` / `#EE4129`; oscuro por defecto.
- Voz: **directa, español chileno neutro**, breve, técnica cuando hace falta, sin hype de casino.
- Aviso +18 y "el juego puede ser adictivo" (README).

## Evidence on Hand
- Historial real de apuestas, bankroll y métricas en Neon (accesible solo vía API).
- Sin testimonios, usuarios externos ni benchmarks públicos: no inventarlos.

## Product Principles
1. El bankroll manda: la UI frena antes de empujar; nunca incentiva apostar más.
2. Incertidumbre visible: cada pick muestra probabilidad, value y riesgo, no solo una recomendación.
3. Rendir cuentas: el resultado (ganado/perdido/nulo) y la calibración se ven tan claros como el pick.
4. Rápido en el día a día: abrir, decidir, registrar, salir.

## Accessibility & Inclusion
WCAG 2.2 AA (tabla de contraste en `docs/PLAN.md`), teclado completo, `prefers-reduced-motion`
respetado en toda animación.
