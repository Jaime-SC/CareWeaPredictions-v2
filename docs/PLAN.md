# CareWeaPredictions v2 — Plan maestro (la biblia)

> Este documento manda. Toda tarea del proyecto sale de una fase de aquí.
> Si algo cambia (decisión, librería, alcance), se actualiza este archivo **antes** de escribir código.

**Objetivo:** rehacer el frontend de CareWeaPredictions desde cero con una identidad visual nueva y
animada, que funcione en **Windows y Android**, manteniendo el backend (API routes + motor de
predicción) y la misma base de datos **Neon PostgreSQL** con todo el historial.

**Repo:** `github.com/Jaime-SC/CareWeaPredictions-v2` (público). El repo original
`Jaime-SC/CareWeaPredictions` queda intacto como referencia hasta el corte (Fase 7).

---

## Reglas permanentes

1. **Autoría:** en commits, PRs y archivos solo aparece **Jaime-SC**. Nunca `Co-Authored-By`,
   "Generated with Claude Code" ni ninguna atribución a IA.
2. **Ponytail:** escalera YAGNI → reutilizar → stdlib → plataforma → dependencia instalada →
   one-liner → código mínimo. Nunca recortar validación, seguridad ni accesibilidad.
3. **Una librería por propósito.** Si dos hacen lo mismo, gana la más vistosa que encaje
   con el stack (ver tabla de decisiones). Añadir una librería nueva = actualizar la tabla.
4. **Backend congelado por defecto:** `app/api/**`, `lib/**`, `prisma/**` se portan tal cual.
   Cambios al backend solo si la fase lo pide explícitamente o hay un bug.
5. **Neon compartida:** la v2 lee y escribe la **misma** base. Ninguna migración destructiva
   sin aprobación explícita. Nunca correr scripts que escriban en la BD como "test".
6. **Animación con propósito:** toda animación respeta `prefers-reduced-motion` y no bloquea
   la interacción (>150 ms de espera visible = mal).
7. **Mobile-first real:** cada pantalla se diseña y prueba primero en 390×844 (Android) y luego
   en escritorio 1440×900 (Windows).
8. **Definición de "hecho" por pantalla:** funciona con datos reales de Neon, pasa
   Playwright en desktop + Android, pasa `impeccable detect`, sin errores de lint/tsc.

---

## Stack y decisiones de librerías

| Necesidad | Elegida | Descartada / nota |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19 + TypeScript** | Se mantiene: el backend ya es Next API routes |
| Estilos | **Tailwind CSS 4** + tokens CSS | — |
| Primitivas UI | **shadcn/ui** (CLI + registries) | Base común de todas las librerías elegidas |
| Motor de animación | **Motion** (`motion`, `motion/react`) | **Anime.js descartada:** redundante con Motion; Motion es React-first y es la base de Magic UI, SmoothUI, Kokonut y Bklit. `framer-motion` del v1 se reemplaza por `motion` |
| Componentes animados | **Magic UI + SmoothUI + Kokonut UI** (registries shadcn) | Las tres compiten: se elige **un componente por propósito** (tabla abajo) |
| unlumen UI | **En evaluación (F1)** | No se pudo verificar instalación ni licencia; entra solo si cubre un hueco |
| Micro-interacciones sueltas | **Uiverse.io** (copiar y portar a Tailwind + tokens) | Solo loaders/checkbox/toggles que no existan en los registries. Verificar licencia de cada pieza |
| Gráficos | **Bklit UI** (d3 + Motion, registry shadcn) | **Recharts descartado** (redundante) |
| Iconos | **Lucide** (`lucide-react`, ISC, gratis) | Variantes animadas (lucide-animated) a evaluar en F1 |
| Tema claro/oscuro | **next-themes** (oscuro por defecto) | — |
| PWA | **`app/manifest.ts` nativo de Next** + service worker mínimo | Serwist solo si F2 confirma que se necesita modo offline |
| App nativa | **Tauri 2** (Windows .msi + Android .apk) en F8 | Requiere instalar Rust + Android SDK/NDK |
| Tests e2e | **Playwright** (`@playwright/test`) proyectos Desktop Edge + Pixel 7 | Agente: `@playwright/cli` con skills |
| Mapa del código | **Graphify** (`graphifyy`, skill de proyecto) | Para navegar el backend sin re-leer todo |
| Calidad de diseño | **Impeccable** (`npx impeccable`, skill) | `PRODUCT.md`, `DESIGN.md`, `impeccable detect` en CI |
| Disciplina de código | **Ponytail** (plugin `ponytail@ponytail`) | `/ponytail-audit` al cierre de cada fase |

### Asignación de componentes animados (un propósito → un componente)

| Propósito | Componente | Origen |
|---|---|---|
| Números que cambian (cuotas, bankroll, ROI) | Number Flow | SmoothUI (gana a Number Ticker de Magic UI: morph de dígitos) |
| Pick destacado / tarjeta hero | Magic Card + Border Beam | Magic UI |
| Fondo del hero / pantallas vacías | Background Paths | Kokonut UI |
| Registrar apuesta (confirmación) | Slide to Confirm | Kokonut UI |
| Métricas de readiness (CLV, yield, hit rate) | Apple Activity Card (anillos) | Kokonut UI |
| Probabilidad de un pick | Liquid Gauge | Kokonut UI |
| Selector de stake / fecha en móvil | Wheel Picker | Kokonut UI |
| Notificaciones de estado (liquidando, cuota API) | Dynamic Island | SmoothUI |
| Cinta de partidos del día | Marquee | Magic UI |
| Cambio de tema | Animated Theme Toggler (View Transitions) | Magic UI — verificar en F1 |
| Barra de navegación escritorio | Dock | Magic UI |

Cualquier cambio a esta tabla se decide en F1 con `/impeccable critique` sobre la página `/lab`.

---

## Paleta y tokens (60 / 30 / 10)

| Rol | Color | Uso |
|---|---|---|
| Principal (60 %) | `#1B4532` | Superficies, fondos de marca, navegación |
| Secundario (30 %) | `#FFFBFC` | Texto en modo oscuro, fondo en modo claro |
| Énfasis (10 %) | `#EE4129` | CTA, pick del día, alertas, foco |

**Modo oscuro (principal):** fondo `#0B1C14` → superficies derivadas de `#1B4532`, texto `#FFFBFC`,
énfasis `#EE4129`. **Modo claro:** fondo `#FFFBFC`, superficies y navegación en `#1B4532`, énfasis igual.

**Contraste WCAG medido (obligatorio respetarlo):**

| Par | Ratio | Veredicto |
|---|---|---|
| `#FFFBFC` sobre `#1B4532` | 10.52 | ✅ AA/AAA texto normal |
| `#EE4129` sobre `#0B1C14` | 4.56 | ✅ AA texto normal |
| `#FFFBFC` sobre `#EE4129` | 3.77 | ⚠️ solo texto grande/negrita (≥ 18.66 px bold) |
| `#EE4129` sobre `#1B4532` | 2.79 | ❌ prohibido para texto |
| `#FFFBFC` sobre `#D63A24` | 4.56 | ✅ variante `accent-strong` para botones con texto normal |

**Estados semánticos:** ganado / perdido / pendiente / nulo necesitan tokens propios. El rojo
de énfasis **no** debe leerse como "perdido": se resuelve en F1 (propuesta: perdido = tono
apagado, no el rojo de CTA).

---

## Fases

Cada fase termina con: commit(s) en `main` firmados por Jaime-SC, `docs/PLAN.md` actualizado
(checklist marcado) y una nota de cierre en la sección **Bitácora**.

### F0 — Fundaciones ✅
- [x] Crear `CareWeaPredictions-v2` con el backend limpio del v1 (API, lib, prisma, scripts, config, data)
- [x] Reglas del proyecto en `CLAUDE.md` + este plan
- [x] Instalar skills de proyecto: Impeccable, Graphify, Playwright CLI; Ponytail como plugin de usuario
- [x] Dependencias base: `motion`, `next-themes`, `lucide-react`; quitar `framer-motion`, `recharts`
- [x] Tokens de color 60/30/10 en `app/globals.css`, modo oscuro por defecto
- [x] Shell mínimo (layout + página de inicio provisional) para que `npm run build` pase
- [x] CI en GitHub Actions: `tsc`, `lint`, build y verify-scripts offline
- [x] Publicar en GitHub (público)

### F1 — Sistema de diseño
- [ ] `/impeccable init` → `PRODUCT.md`; `/impeccable document` → `DESIGN.md`
- [ ] Tipografía (display + texto + números tabulares), escala, radios, sombras, ritmo de espaciado
- [ ] Tokens de movimiento: duraciones, springs, easing; soporte `prefers-reduced-motion`
- [ ] Tokens semánticos de estado (ganado/perdido/pendiente/nulo, value, riesgo)
- [ ] Inicializar shadcn y registrar `@magicui`, `@smoothui`, `@kokonutui`, `@bklit`
- [ ] Evaluar unlumen UI y lucide-animated; cerrar la tabla de asignación
- [ ] Página `/lab` (solo dev) con todos los componentes elegidos en ambos temas
- [ ] `/impeccable critique` + `impeccable detect` sobre `/lab` sin hallazgos graves

### F2 — Shell de la aplicación + PWA
- [ ] Layout adaptativo: **Dock** en escritorio (Windows), **barra inferior** en Android
- [ ] Transiciones entre páginas (Motion `AnimatePresence` / View Transitions)
- [ ] Toggle de tema animado, persistencia, sin flash al cargar
- [ ] Header con bankroll (Number Flow) + cuota API-Football (Dynamic Island)
- [ ] PWA: `manifest.ts`, iconos maskable, `theme_color` = `#1B4532`, prompt de instalación
- [ ] Decidir si hace falta offline (Serwist) — registrar decisión aquí
- [ ] Playwright: navegación y tema en Desktop Edge + Pixel 7

### F3 — Pantallas núcleo (con datos reales de Neon)
- [ ] **Inicio / Picks seguros** (`/api/predict`): pick del día (Magic Card), lista, filtros de liga/país
- [ ] **Constructor de combinadas** (`/api/parlay`): modos, recalculo en vivo, copiar ticket
- [ ] **Registrar apuesta** (`/api/bets/record`) con Slide to Confirm
- [ ] **Historial / bankroll** (`/api/bankroll`, `/api/results`): estados, liquidación
- [ ] Estados vacíos, carga (skeleton animado) y error en cada pantalla
- [ ] Playwright e2e de cada flujo en ambos dispositivos

### F4 — Analítica
- [ ] **Stats** (`/api/stats`, `/api/stats/summary`): ROI, yield, hit rate con gráficos Bklit
- [ ] **Salud del modelo** (`/api/analytics/health`): CLV, calibración, drawdown, anillos de readiness
- [ ] **Equipos** (`/api/teams/profiles`): perfiles, forma, splits local/visita
- [ ] Rendimiento por **tipo de mercado** (base para F5)

### F5 — Datos frescos y calidad del modelo
- [ ] Workflow programado para `timesfm_forecast.py` (último dato en Neon: 2026-10-01)
- [ ] Workflow programado para `ingest_referees.py` (último dato en Neon: 2026-09-03)
- [ ] Análisis de acierto/calibración por mercado con el historial liquidado
- [ ] Validar o castigar mercados secundarios (córners/tarjetas, hoy heurísticos)
- [ ] Ajustar auto-tuning según el análisis; documentar resultados aquí

### F6 — Calidad y limpieza
- [ ] Suite Playwright completa (smoke + flujos) en CI
- [ ] Accesibilidad: teclado, foco visible, lector de pantalla, contraste (tabla de arriba)
- [ ] Rendimiento: Lighthouse móvil ≥ 90 en Performance y Accesibilidad
- [ ] `/impeccable audit` y `/ponytail-audit` sobre todo el repo
- [ ] Podar `lib/` de módulos solo-cliente del v1 que la v2 no usa

### F7 — Despliegue y corte
- [ ] Proyecto Vercel nuevo apuntando a la v2, variables de entorno (Neon, API-Football, CRON_SECRET)
- [ ] **Antes** de activar los crons de la v2, desactivar los del v1 (evitar doble liquidación)
- [ ] Verificación en producción: predicciones, liquidación, bankroll
- [ ] Archivar o marcar como legacy el repo v1

### F8 — Apps nativas (Tauri 2)
- [ ] Instalar Rust, Tauri CLI, Android SDK + NDK
- [ ] Shell Tauri que carga la app desplegada (el backend vive en Vercel)
- [ ] Build Windows (`.msi`) y Android (`.apk`), iconos y splash con la paleta
- [ ] Publicar binarios en GitHub Releases

---

## Bitácora
_Una entrada por fase cerrada: fecha, qué se hizo, decisiones, pendientes._

### 2026-11-26 — F0 cerrada
- Backend portado desde el v1 ya limpio (sin Groq, sin The Odds API, sin árboles XGBoost vacíos).
  El modelo de mercados secundarios es heurístico: `lib/secondary-markets.ts`.
- Eliminados los módulos solo-cliente del v1 (`api-rate-limit-cooldown`, `bankroll-store`,
  `bet-record-client`, `builder-restore`, `dashboard-storage`): el frontend nuevo define su propio estado.
- Skills de proyecto en `.claude/skills/`: impeccable (+ hooks en `.claude/settings.json`), graphify
  (grafo local en `graphify-out/`, no versionado), playwright-cli (Edge como navegador por defecto).
- Ponytail va como plugin de usuario (`ponytail@ponytail` v5.3.3, marketplace
  `DietrichGebert/ponytail`, con hooks/statusline); se borró la copia local de sus 6 skills.
  Quien clone el repo debe instalar el plugin para tener `/ponytail-audit`.
- CI: `tsc` + lint + `npm run verify` (38/38) + build + Playwright (Desktop Edge y Pixel 7).
- `ingest-advanced-stats.yml` queda **solo manual** en la v2 hasta el corte (F7): el v1 lo sigue
  corriendo a diario contra la misma Neon.
- Tipografía Geist es provisional (se decide en F1).
