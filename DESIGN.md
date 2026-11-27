---
name: CareWeaPredictions
description: Motor de predicción de fútbol que muestra su incertidumbre y protege el bankroll.
colors:
  brand: "#1b4532"
  brand-paper: "#fffbfc"
  brand-accent: "#ee4129"
  brand-accent-strong: "#d63a24"
  background: "#0b1c14"
  foreground: "#fffbfc"
  card: "#12301f"
  muted: "#163a27"
  muted-foreground: "#b3c4b9"
  primary: "#d63a24"
  primary-foreground: "#fffbfc"
  secondary: "#1b4532"
  ring: "#ee4129"
  won: "#5bd68a"
  lost: "#d3a19a"
  pending: "#e9c46a"
  void: "#a3b5aa"
  value: "#7cc8f2"
  risk: "#f4a261"
  light-background: "#fffbfc"
  light-foreground: "#10261b"
  light-card: "#ffffff"
  light-muted: "#f3eeee"
  light-muted-foreground: "#4c5e54"
  light-accent: "#ebf1ed"
  light-ring: "#d63a24"
  light-won: "#17703f"
  light-lost: "#8e4a43"
  light-pending: "#7a5a00"
  light-void: "#56685e"
  light-value: "#0b6590"
  light-risk: "#a4500f"
typography:
  display-lg:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 9vw + 1.25rem, 5rem)"
    fontWeight: 400
    lineHeight: 0.9
    fontVariation: "opsz auto"
  display:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 400
    lineHeight: 0.92
  display-sm:
    fontFamily: "Big Shoulders, Arial Narrow, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 0.95
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
  body-lg:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
  body:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  figure:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 400
    fontFeature: "tnum"
rounded:
  sm: "0.4375rem"
  md: "0.65625rem"
  lg: "0.875rem"
  xl: "1.225rem"
  2xl: "1.575rem"
  pill: "9999px"
spacing:
  gutter: "16px"
  gutter-md: "32px"
  card: "20px"
  card-md: "28px"
  section: "48px"
  section-md: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  button-ghost:
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    height: "36px"
    padding: "0 10px"
  status-badge:
    textColor: "{colors.value}"
    rounded: "{rounded.pill}"
    height: "24px"
    padding: "0 10px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.2xl}"
    padding: "{spacing.card}"
---

# Design System: CareWeaPredictions

## Overview

**Creative North Star: "El marcador honesto"**

Un tablero de cancha nocturna: verde profundo de fondo, cifras grandes y condensadas como en un marcador de estadio, y una sola chispa roja que marca la acción. Todo lo demás está al servicio de leer números rápido y sin trampa: la probabilidad del modelo junto a la que implica la cuota, el value con su signo, el resultado liquidado con su ícono y su palabra.

La densidad es de herramienta diaria, no de casino. El oscuro es el modo por defecto y el claro es una traducción completa con sus propios valores de estado, no una inversión. La interfaz frena antes de empujar: el stake sugerido se muestra al lado del elegido y, sobre el 2 % del bankroll, aparece un aviso de riesgo. El movimiento es corto, con ease-out expo, y desaparece con `prefers-reduced-motion`.

Los componentes vendorizados (Magic UI, Kokonut, Bklit, shadcn, lucide-animated) se re-tokenizan al entrar al proyecto: ningún zinc, emerald ni red de origen sobrevive en la superficie compartida.

**Key Characteristics:**
- Verde cancha 60 %, papel 30 %, rojo 10 %; oscuro por defecto.
- Big Shoulders en mayúsculas para marcador y cifras grandes; Schibsted Grotesk para la interfaz; Geist Mono tabular para cuotas y montos.
- Estados siempre como ícono + palabra + tinte al 14 %, nunca solo color.
- Gráficos neutros que comparan contra la probabilidad implícita.
- Profundidad por superficies tonales más dos sombras con desplazamiento y desenfoque.

## Colors

Un verde cancha casi negro sostiene todo; el papel cálido da el texto y una sola familia roja carga la acción y el foco, mientras seis tonos de estado hablan solo de resultados y señales del modelo.

### Primary
- **Verde Cancha** (brand): color de marca, superficies de marca, botón secundario, `themeColor` del navegador y relleno quieto de hover (`accent` de shadcn en oscuro).
- **Rojo Tarjeta Fuerte** (brand-accent-strong / primary): CTA con texto normal ("Registrar apuesta"), selección de texto y `ring` en modo claro. Es la variante que pasa AA con papel encima (4.56:1).
- **Rojo Tarjeta** (brand-accent / ring): foco en oscuro, caret, el haz del pick del día. Énfasis, no superficie de texto.

### Neutral
- **Noche de Estadio** (background): fondo oscuro por defecto.
- **Césped Bajo Focos** (card): tarjetas, popovers, tooltips de gráficos.
- **Césped Sombra** (muted): cabeceras de tabla, pistas de barras, esqueletos.
- **Salvia Gris** (muted-foreground): metadatos, notas, ejes (9.67:1 sobre fondo).
- **Papel Cálido** (brand-paper / foreground): texto en oscuro, fondo en claro.
- Bordes e inputs son mezclas del papel al 12 % / 16 % (oscuro) y del verde al 14 % / 22 % (claro).

### Estados y señales
- **Ganada** (won), **Perdida** (lost, arcilla apagada), **Pendiente** (pending), **Nula** (void), **Value** (value), **Riesgo** (risk). Cada uno tiene su valor oscuro y su valor claro (`light-*`); todos pasan 4.5:1 sobre fondo, tarjeta y su propio tinte al 14 %, verificado por `scripts/verify-contrast.ts`.
- `chart-1..5` reutilizan las señales (value, won, pending, risk, lost).

### Named Rules
**The Red Is Action Rule.** El rojo marca la acción principal y el foco. Nunca texto `#EE4129` sobre `#1B4532` (2.79:1, prohibido); un botón rojo con texto normal usa `brand-accent-strong`.

**The Clay Loss Rule.** "Perdida" es arcilla apagada (`lost`), nunca el rojo de CTA: perder no compite con la acción.

**The Machine-Checked Pair Rule.** Todo par de texto nuevo se agrega a `scripts/verify-contrast.ts` en hex; si no pasa (4.5 texto, 3 ring), no entra.

## Typography

**Display Font:** Big Shoulders (con Arial Narrow, sans-serif), eje `opsz` con optical sizing automático
**Body Font:** Schibsted Grotesk (con system-ui, sans-serif)
**Label/Mono Font:** Geist Mono (con ui-monospace), siempre con `tabular-nums`

**Character:** Una condensada de marcador de estadio contra una grotesca de periódico sobria; la mono tabular hace que las cuotas y los montos se alineen y no bailen al cambiar.

### Hierarchy
- **Display L** (400, clamp 56→80 px, 0.9): el partido del pick del día y el bankroll principal. Mayúsculas.
- **Display** (400, 56 px, 0.92): títulos de pantalla y la probabilidad del modelo.
- **Display S** (400, 40 px, 0.95): títulos de sección y estados vacíos. Mayúsculas.
- **Title** (600, 24 px): enunciado de un pick ("Gana local a 1,85").
- **Body L** (500, 18 px): líneas de decisión ("Stake sugerido: 1 % del bankroll").
- **Body** (400, 16 px): explicación; notas de sección a 65ch máximo con `text-pretty`.
- **Label** (400, 14 px, muted-foreground): metadatos de liga, hora y leyendas.
- **Cifra** (Geist Mono, tabular): cuotas, stake, CLP, porcentajes y horas, desde 12 px en tablas hasta 24 px en métricas.

### Named Rules
**The Scoreboard Rule.** Big Shoulders va en mayúsculas y solo en titulares y cifras grandes; nunca en párrafos ni en controles.

**The Tabular Figure Rule.** Toda cifra que se compara o cambia (cuota, monto, porcentaje, hora) va en Geist Mono con `tabular-nums`; los montos usan formato `es-CL` (CLP sin decimales, coma decimal).

## Layout

Mobile-first a 390×844, luego escritorio a 1440×900. Contenedor centrado de 72rem (`max-w-6xl`) con medianil de 16 px que sube a 32 px desde `md`. Las secciones se separan con un borde superior y 48 px de aire vertical (64 px en `md`); las tarjetas usan 20 px de relleno (28 px en el héroe de escritorio). Las grillas colapsan a una columna en móvil y se abren a dos (o `1fr 20rem` para pick + barra de probabilidad) desde `md`. Las tablas esconden columnas secundarias bajo `sm` en vez de desbordar. La navegación de escritorio es un dock flotante; la barra inferior de Android llega en F2.

## Elevation & Depth

Híbrido: la profundidad base es tonal (fondo → tarjeta → muted, cada paso un verde más claro) y solo lo flotante lleva sombra. Las sombras son suaves, con desplazamiento vertical y desenfoque, más profundas en oscuro y teñidas de verde en claro.

### Shadow Vocabulary
- **Raised** (`box-shadow: var(--shadow-raised)`): tooltips y elementos levemente elevados sobre una tarjeta.
- **Overlay** (`box-shadow: var(--shadow-overlay)`): dock, isla de estado y todo lo que flota sobre la página.

### Named Rules
**The Tonal-First Rule.** Una tarjeta en reposo se distingue por tono y borde, no por sombra; la sombra se reserva para lo que flota.

## Shapes

Esquinas generosas derivadas de una sola base de 14 px (`--radius`): botones a 14 px, tarjetas grandes a ~25 px (`rounded-2xl`), piezas internas a ~20 px (`rounded-xl`), muestras de color a 14 px. Badges, toggles, pistas de barras y botones de ícono son píldoras o círculos completos. Bordes de 1 px con la mezcla translúcida de `border`; nada de bordes gruesos ni esquinas rectas.

## Components

### Buttons
- **Shape:** esquinas suaves (`rounded-lg`, 14 px), alto 32 px por defecto y 36 px en `lg`.
- **Primary:** rojo fuerte con papel encima; hover baja la opacidad al 80 %. Uno por vista: la acción principal.
- **Secondary:** verde cancha con papel; **Outline:** fondo con borde de `input`; **Ghost:** solo texto, hover a `muted`.
- **Hover / Focus:** foco visible con borde `ring` y halo al 50 %; al presionar baja 1 px. Deshabilitado al 50 % de opacidad.

### Status Badge (firma)
- Píldora de 24 px, texto de 13 px medio, tinte del estado al 14 % de fondo y el tono pleno en texto e ícono lucide. Etiquetas por defecto: Ganada, Perdida, Pendiente, Nula, Value, Riesgo; acepta texto propio ("Value +6,2 %").

### Cards / Containers
- **Corner Style:** `rounded-2xl` (~25 px).
- **Background:** `card` sobre `background`; borde de 1 px.
- **Shadow Strategy:** ninguna en reposo (ver Elevation).
- **Internal Padding:** 20 px; 28 px en el héroe de escritorio.

### Probability Bar (firma)
- Pista de 12 px en `muted`; relleno neutro (`foreground` al 25 %) hasta la probabilidad del modelo; una marca vertical en la probabilidad implícita (1 / cuota); el tramo entre ambas teñido de `value` si el modelo va adelante o `risk` si el mercado va adelante. Expone `role="meter"` con un `aria-valuetext` que dice modelo, implícita y value.

### Charts (Bklit)
- Barras y líneas neutras (`foreground` al 70 %, `muted-foreground` al 40 %); la comparación es contra la probabilidad implícita, no contra un color de estado. Líneas de dinero con curva monótona. P&L acumulado en vez de bankroll bruto, para que el eje no aplaste la variación.

### Activity Rings (salud del modelo)
- Cada anillo mide muestra liquidada contra la necesaria para juzgar esa métrica (CLV, Yield, Acierto) con colores `value` / `won` / `pending`. El valor actual va al lado en texto. Un anillo lleno significa "ya se puede juzgar", no "el modelo gana".

### Stake Picker
- Rueda táctil (WheelPicker) operable con flechas; muestra el sugerido (1 % del bankroll) y, sobre el 2 %, un Status Badge de riesgo en una región `aria-live`.

### Navigation
- Dock flotante de escritorio: píldora de 58 px, `card` al 90 % con desenfoque y sombra overlay, íconos lucide-animated de 22 px en botones circulares de 44 px con tooltip `popover` al hover y al foco.

### Ticker de partidos
- Marquee continuo de tarjetas `rounded-xl` con hora y cuota en mono; se pausa al hover, tiene botón "Pausar cinta" (WCAG 2.2.2) y queda quieto con movimiento reducido.

## Do's and Don'ts

### Do:
- **Do** usar `brand-accent-strong` (#D63A24) para todo botón rojo con texto normal.
- **Do** acompañar cada estado con ícono + palabra + tinte al 14 %.
- **Do** escribir cuotas, montos y porcentajes en Geist Mono tabular con formato `es-CL`.
- **Do** comparar en los gráficos contra la probabilidad implícita y mantener las barras neutras.
- **Do** re-tokenizar todo componente vendorizado al incorporarlo: cero zinc/emerald/red de origen.
- **Do** usar `motion/react` con los tokens de `components/motion/tokens.ts` (150/240/420 ms, ease-out expo; springs snappy, gentle, bouncy) bajo `MotionConfig reducedMotion="user"`.
- **Do** registrar cada par de contraste nuevo en `scripts/verify-contrast.ts`.

### Don't:
- **Don't** poner texto `#EE4129` sobre `#1B4532` (2.79:1).
- **Don't** pintar "Perdida" con el rojo de CTA.
- **Don't** usar color de estado como relleno decorativo de barras o fondos.
- **Don't** usar el spring `bouncy` fuera del único momento celebratorio (apuesta confirmada) ni en loops.
- **Don't** animar nada que dure más de 5 s sin control de pausa.
- **Don't** usar lenguaje ni brillo de casino; la voz es directa, en español chileno neutro.
