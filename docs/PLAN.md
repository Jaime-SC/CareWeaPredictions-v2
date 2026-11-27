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
| Componentes animados | **Magic UI + Kokonut UI** (registries shadcn); SmoothUI registrado | Se elige **un componente por propósito** (tabla abajo). F1: SmoothUI queda registrado pero sin componentes elegidos |
| unlumen UI | **Descartada (F1)** | Se instala por registry (`@unlumen-ui`) y su repo de docs es MIT, pero el índice shadcn la marca *degraded* y duplica Dock/theme toggle/dígitos; el skeleton lo cubre `Skeleton` de shadcn |
| Micro-interacciones sueltas | **Uiverse.io** (copiar y portar a Tailwind + tokens) | Solo loaders/checkbox/toggles que no existan en los registries. Verificar licencia de cada pieza |
| Gráficos | **Bklit UI** (d3 + Motion, registry shadcn) | **Recharts descartado** (redundante) |
| Iconos | **Lucide** (`lucide-react`, ISC, gratis) + **lucide-animated** (MIT, registry `@lucide-animated`) | F1: lucide-animated solo para íconos que animan por estado o en navegación (Dock/barra inferior, confirmación, liquidando); el resto, `lucide-react` estático |
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
| Números que cambian (cuotas, bankroll, ROI) | Number Flow | **`@number-flow/react`** directo (F1: el `number-flow` de SmoothUI es un stepper de enteros 0–999 con botones; la librería que lo inspira hace el morph con `Intl`, decimales y CLP). Gana a Number Ticker de Magic UI |
| Pick destacado / tarjeta hero | Border Beam | Magic UI (F1: Magic Card descartada; spotlight + beam recargaban el hero) |
| Fondo del hero / pantallas vacías | Background Paths | Kokonut UI |
| Registrar apuesta (confirmación) | Slide to Confirm | Kokonut UI |
| Métricas de readiness (CLV, yield, hit rate) | Apple Activity Card (anillos) | Kokonut UI — cada anillo = muestra liquidada vs la necesaria; el valor va al lado |
| Probabilidad de un pick | `ProbabilityBar` (propio, Motion) | F1: Liquid Gauge descartado: se leía como "tanque lleno"; la barra dibuja la brecha modelo vs implícita, que es el value |
| Selector de stake / fecha en móvil | Wheel Picker | Kokonut UI |
| Notificaciones de estado (liquidando, cuota API) | Status Island | Kokonut UI (F1: la Dynamic Island de SmoothUI es una demo con llamada/música fija y un `setInterval` dentro de `useMemo`) |
| Cinta de partidos del día | Marquee | Magic UI |
| Cambio de tema | Animated Theme Toggler (View Transitions) | Magic UI |
| Barra de navegación escritorio | Dock | Magic UI |
| Gráficos (bankroll, yield por mercado) | Line Chart + Bar Chart | Bklit UI |
| Carga (skeleton) | Skeleton | shadcn/ui |
| Estado de apuesta (ganado/perdido/pendiente/nulo) | Badge + tokens `won/lost/pending/void` | shadcn/ui |

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

**Estados semánticos (F1):** tokens `won` / `lost` / `pending` / `void` + señales `value` / `risk`
en `app/globals.css`. `lost` es un arcilla apagado (`#D3A19A` oscuro / `#8E4A43` claro), nunca el
rojo de CTA. Los badges van siempre con ícono + palabra + tinte al 14 %.

**Pares de tokens (F1), verificados por `scripts/verify-contrast.ts` (parte de `npm run verify`;
mínimo 4.5 para texto, 3 para `ring`):**

| Par (token sobre token) | Oscuro | Claro |
|---|---|---|
| `foreground` sobre `background` | #fffbfc / #0b1c14 → 17.18 | #10261b / #fffbfc → 15.56 |
| `foreground` sobre `card` | #fffbfc / #12301f → 13.93 | #10261b / #ffffff → 15.97 |
| `foreground` sobre `muted` | #fffbfc / #163a27 → 12.26 | #10261b / #f3eeee → 13.90 |
| `muted-foreground` sobre `background` | #b3c4b9 / #0b1c14 → 9.67 | #4c5e54 / #fffbfc → 6.74 |
| `muted-foreground` sobre `card` | #b3c4b9 / #12301f → 7.84 | #4c5e54 / #ffffff → 6.92 |
| `muted-foreground` sobre `muted` | #b3c4b9 / #163a27 → 6.90 | #4c5e54 / #f3eeee → 6.02 |
| `primary-foreground` sobre `primary` | #fffbfc / #d63a24 → 4.56 | #fffbfc / #d63a24 → 4.56 |
| `secondary-foreground` sobre `secondary` | #fffbfc / #1b4532 → 10.52 | #fffbfc / #1b4532 → 10.52 |
| `ring` sobre `background` | #ee4129 / #0b1c14 → 4.56 | #d63a24 / #fffbfc → 4.56 |
| `ring` sobre `card` | #ee4129 / #12301f → 3.69 | #d63a24 / #ffffff → 4.68 |
| `won` sobre `background` | #5bd68a / #0b1c14 → 9.60 | #17703f / #fffbfc → 5.97 |
| `won` sobre `card` | #5bd68a / #12301f → 7.78 | #17703f / #ffffff → 6.13 |
| `won` sobre `won (tinte 14 %)` | #5bd68a / #1c472e → 5.74 | #17703f / #dfebe4 → 5.00 |
| `lost` sobre `background` | #d3a19a / #0b1c14 → 7.84 | #8e4a43 / #fffbfc → 6.37 |
| `lost` sobre `card` | #d3a19a / #12301f → 6.36 | #8e4a43 / #ffffff → 6.54 |
| `lost` sobre `lost (tinte 14 %)` | #d3a19a / #2d4030 → 4.95 | #8e4a43 / #efe6e5 → 5.33 |
| `pending` sobre `background` | #e9c46a / #0b1c14 → 10.56 | #7a5a00 / #fffbfc → 6.22 |
| `pending` sobre `card` | #e9c46a / #12301f → 8.56 | #7a5a00 / #ffffff → 6.38 |
| `pending` sobre `pending (tinte 14 %)` | #e9c46a / #30452a → 6.25 | #7a5a00 / #ece8db → 5.21 |
| `void` sobre `background` | #a3b5aa / #0b1c14 → 8.19 | #56685e / #fffbfc → 5.78 |
| `void` sobre `card` | #a3b5aa / #12301f → 6.64 | #56685e / #ffffff → 5.94 |
| `void` sobre `void (tinte 14 %)` | #a3b5aa / #264332 → 5.05 | #56685e / #e7eae8 → 4.90 |
| `value` sobre `background` | #7cc8f2 / #0b1c14 → 9.58 | #0b6590 / #fffbfc → 6.24 |
| `value` sobre `card` | #7cc8f2 / #12301f → 7.76 | #0b6590 / #ffffff → 6.41 |
| `value` sobre `value (tinte 14 %)` | #7cc8f2 / #21453d → 5.75 | #0b6590 / #dde9ef → 5.18 |
| `risk` sobre `background` | #f4a261 / #0b1c14 → 8.56 | #a4500f / #fffbfc → 5.48 |
| `risk` sobre `card` | #f4a261 / #12301f → 6.94 | #a4500f / #ffffff → 5.63 |
| `risk` sobre `risk (tinte 14 %)` | #f4a261 / #324028 → 5.36 | #a4500f / #f2e6dd → 4.59 |

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

### F1 — Sistema de diseño ✅
- [x] `/impeccable init` → `PRODUCT.md`; `/impeccable document` → `DESIGN.md`
- [x] Tipografía (display + texto + números tabulares), escala, radios, sombras, ritmo de espaciado
- [x] Tokens de movimiento: duraciones, springs, easing; soporte `prefers-reduced-motion`
- [x] Tokens semánticos de estado (ganado/perdido/pendiente/nulo, value, riesgo)
- [x] Inicializar shadcn y registrar `@magicui`, `@smoothui`, `@kokonutui`, `@bklit`
- [x] Evaluar unlumen UI y lucide-animated; cerrar la tabla de asignación
- [x] Página `/lab` (solo dev) con todos los componentes elegidos en ambos temas
- [x] `/impeccable critique` + `impeccable detect` sobre `/lab` sin hallazgos graves

### F2 — Shell de la aplicación + PWA
- [ ] Layout adaptativo: **Dock** en escritorio (Windows), **barra inferior** en Android
- [ ] Transiciones entre páginas (Motion `AnimatePresence` / View Transitions)
- [ ] Toggle de tema animado, persistencia, sin flash al cargar
- [ ] Header con bankroll (Number Flow) + cuota API-Football (Status Island)
- [ ] PWA: `manifest.ts`, iconos maskable, `theme_color` = `#1B4532`, prompt de instalación
- [ ] Decidir si hace falta offline (Serwist) — registrar decisión aquí
- [ ] Playwright: navegación y tema en Desktop Edge + Pixel 7

### F3 — Pantallas núcleo (con datos reales de Neon)
- [ ] **Inicio / Picks seguros** (`/api/predict`): pick del día (Magic Card), lista, filtros de liga/país
- ~~**Constructor de combinadas** (`/api/parlay`)~~ — **fuera de alcance (2026-11-26):** la v2 es solo
  picks seguros (simples). `/api/parlay` queda en el backend congelado sin uso en la UI.
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

### 2026-11-26 — F1 cerrada
- `PRODUCT.md` (`/impeccable init`) y `DESIGN.md` + `.impeccable/design.json` (`/impeccable document`).
  **Alcance de producto:** la v2 es solo picks seguros; el constructor de combinadas sale de F3.
- **Tipografía "Marcador":** Big Shoulders (display, eje `opsz`, mayúsculas) + Schibsted Grotesk (UI) +
  Geist Mono con `tabular-nums` para cuotas y montos. `display-lg` fluido con `clamp()`.
- **Tokens** en `app/globals.css` (Tailwind 4): superficies alineadas a la semántica shadcn
  (`primary` = CTA `#D63A24`, `accent` = hover silencioso), radio base 0.875rem, `shadow-raised` /
  `shadow-overlay`, estados `won/lost/pending/void` + `value/risk` (perdida = arcilla apagada).
  Bloque oscuro en `:root, .dark` para poder forzar tema por sección. Contraste verificado por
  `scripts/verify-contrast.ts`, ahora parte de `npm run verify` (39/39).
- **Movimiento:** `components/motion/tokens.ts` (150/240/420 ms, ease-out expo, springs
  snappy/gentle/bouncy) y `<MotionConfig reducedMotion="user">` en `app/providers.tsx`.
- **Componentes:** shadcn (radix) + registries `@magicui`, `@smoothui`, `@kokonutui`, `@bklit`,
  `@lucide-animated`. Se re-tokenizaron los colores fijos (zinc/emerald/red) de Kokonut y Magic UI;
  textos de accesibilidad en español; formateadores de Bklit en `es-CL`. Nuevos propios:
  `StatusBadge`, `ProbabilityBar`.
- **Descartados:** SmoothUI Number Flow (stepper 0–999) → `@number-flow/react`; SmoothUI Dynamic
  Island (demo) → Kokonut Status Island; Kokonut Liquid Gauge → `ProbabilityBar`; Magic Card
  (recargaba el hero); unlumen UI (registry *degraded*, duplica lo elegido). lucide-animated entra
  solo para íconos con estado o navegación.
- **`/lab`** (404 en producción, datos de ejemplo, sin Neon) + smoke Playwright en Desktop Edge y
  Pixel 7. `/impeccable critique`: 23/36 → se corrigieron los 2 P1 y los 3 P2 (anillos = muestra
  liquidada, hidratación del toggler, gráficos con eje Y y referencia implícita, tabla y stake en
  móvil, Dock 44 px). `impeccable detect`: solo queda `marquee` (aceptado: asignado por el plan,
  con pausa por teclado y stop con movimiento reducido).
- **Trampas encontradas:** `shadcn init` sobrescribió `lib/utils.ts` (backend congelado) y añadió
  el paquete `cn`: se restauró y se quitó. Cada `shadcn add` puede re-inyectar bloques `:root`/`.dark`
  al final de `globals.css` que pisan los tokens: revisar el diff tras cada instalación.
  ESLint: `react-hooks/refs` e `immutability` apagadas solo para `components/charts/**` y
  `components/kokonutui/**` (código vendorizado).
- **Pendientes:** unificar formato CLP (`lib/utils.formatCLP` "$5.000 CLP" vs `Intl` "$5.000")
  antes de F3; demo de estado de error en Status Island; barra inferior Android y Dock reales en F2.

