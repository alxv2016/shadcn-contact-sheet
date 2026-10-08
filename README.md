# Contact Sheet

A theme creator for [shadcn/ui](https://ui.shadcn.com) that is driven by your own design tokens.

It mirrors shadcn's [Create](https://ui.shadcn.com/create) page — pick a style, colors, radius and fonts and watch every component update — with one difference: **every shadcn theme variable is an alias of a design-system token**. Instead of choosing raw colors, you choose tokens from your [Style Dictionary](https://styledictionary.com) package, and the result is a token mapping you can keep in your pipeline.

```css
--primary: var(--color-bg-action-primary); /* color.bg-action-primary → color.blue-600 = hsl(215, 100%, 40%) */
```

## Features

- **Token-driven theme editor.** Map each shadcn variable (`background`, `primary`, `ring`, `chart-1`, `radius`, …) to a semantic or primitive token, separately for light and dark mode. Hovering a token previews it live.
- **Theme and chart color families, radius, fonts, spacing, shadows and focus ring**, all chosen from your tokens.
- **All eight shadcn styles** (Vega, Nova, Maia, Lyra, Mira, Luma, Sera, Rhea).
- **Preview views:** shadcn's two showcase layouts, every component example, 70 charts, and a **Tokens** view that lists each shadcn theme token, what it controls and the design token it maps to.
- **Tailwind with tokens as the single source of truth.** Tailwind's default colors, type, radius, shadow and breakpoint scales are reset and rebuilt from your tokens; Tailwind only provides the utility classes.
- **Accessible global focus ring:** a 2px outline with a 2px offset, from your focus tokens, with live WCAG contrast checks.
- **Get Code** shows every generated file with syntax highlighting; **Save Theme** downloads the whole theme as a `.zip`.

## Requirements

- Node.js 22 or newer
- npm

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173). `npm run dev` builds the tokens first, so there is no separate setup step.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Builds the tokens, then starts the Vite dev server. |
| `npm run build` | Builds the tokens, type-checks, and creates a production build in `dist/`. |
| `npm run preview` | Serves the production build locally. |
| `npm run typecheck` | Type-checks the project (run `npm run tokens:build` first on a fresh clone). |
| `npm run tokens:build` | Compiles `tokens/` with Style Dictionary into `src/tokens/generated/`. |
| `npm run tokens:sync` | Copies the design-token sources from your token package into `tokens/`. |

## How it works

```
tokens/*.json ──► Style Dictionary (scripts/build-tokens.mjs) ──► src/tokens/generated/
                                                                    tokens.css           DS tokens as CSS variables
                                                                    shadcn.theme.css     the shadcn theme token mapping
                                                                    tailwind.theme.css   Tailwind theme built from the tokens
                                                                    catalog.json         token list for the editor's pickers
```

The app has two pages: the **editor** (`index.html`) and the **preview** (`preview.html`), which the editor loads in an iframe — the same setup as shadcn's Create page. Edits are sent to the preview over `postMessage`, so the preview never reloads.

### Design tokens

`tokens/primitive.*.json` and `tokens/semantic.*.json` are the design-system sources (DTCG format, exported by Token Bridge for Figma). Semantic tokens alias primitives, e.g. `color.bg-default → color.white`, and the generated CSS keeps that chain as `var()` references.

To pull in updated tokens from your token package:

```bash
npm run tokens:sync                                   # default: ~/Desktop/style-dictionary-tokens/tokens
TOKENS_DIR=/path/to/your-package/tokens npm run tokens:sync
```

This copies only `primitive.*` and `semantic.*` files; the shadcn mapping files below are never overwritten.

### The shadcn theme token mapping

The mapping lives in three files in `tokens/`:

| File | Contents |
| --- | --- |
| `shadcn.semantic.json` | Light-mode colors and `radius` (Token Bridge adapter format) |
| `dark.shadcn.semantic.json` | Dark-mode colors |
| `shadcn.extensions.json` | Fonts, spacing unit, shadows and focus ring (the same in both modes) |

Each entry points a shadcn variable at a token:

```json
{
  "primary": { "$type": "color", "$value": "{color.bg-action-primary}" }
}
```

`npm run tokens:build` turns them into `shadcn.theme.css`, grouped by section and annotated with what each alias resolves to. The build stops with an error if a mapping points at a token that doesn't exist. The list of shadcn variables and the CSS formatter are shared by the build and the editor in `src/theme/shadcn-theme.mjs`, so the generated file always matches what the editor shows.

### Tailwind theme

`tailwind.theme.css` resets Tailwind's own scales with `initial` and rebuilds them from your tokens:

- Every token becomes a utility: `bg-blue-500`, `bg-bg-default`, `text-body`, `rounded-card`, `shadow-raised`, `gap-stack-md`, ….
- Tailwind names that shadcn components rely on (`text-sm`, `font-medium`, `leading-tight`, …) point at your nearest token, and only when it is within 10% of Tailwind's default value. Names with no close token are not generated.
- Breakpoints are written as literal px values from your breakpoint tokens, because media queries can't read CSS variables.

### Rem values

The Token Bridge export authored rem values against a 22px root ("Base unit for rem conversion: 22"). Browsers use 16px, so the build rebases rem dimensions to keep the pixel sizes designed in Figma (`0.727rem` → 16px → `1rem`). Override the bases if your export changes:

```bash
TOKENS_SOURCE_REM_BASE=16 TOKENS_TARGET_REM_BASE=16 npm run tokens:build
```

## Using the editor

- **Light / Dark** switches which mode's colors you are editing and the preview's mode (shortcut: `d`).
- **Style, Theme, Chart Color, Radius Multiplier, Font, Heading, Spacing Multiplier** are quick pickers; the **Colors** sections let you map every variable individually.
- **Theme overrides** set radius, spacing, control height, icon size, text size and font weight on individual components (Button, Input & select, Badge, Card, Dialog, Popover, Chat bubble), replacing the values the Style gives them; each component lists the ones that apply (Card, Dialog and Popover set their title's size and weight). Each override picks a token; the × button returns it to the style default. They are exported as `shadcn.overrides.css`, which targets shadcn's `data-slot` attributes so it works with any style.
- **Shuffle** picks a random style, color family (for both Theme and Chart Color) and radius. **Reset** returns to the mapping in `tokens/`.
- The switcher at the bottom right changes the preview: **01**, **02**, **Components**, **Charts** (with a chart-type switcher at the bottom left) and **Tokens**.
- Your current theme is kept in the browser between visits.

### Saving a theme

**Get Code** shows each file of the current theme, with copy and download buttons:

- `shadcn.theme.css`, `shadcn.semantic.json`, `dark.shadcn.semantic.json`, `shadcn.extensions.json`
- `shadcn.overrides.css` — component overrides from Theme overrides
- `tailwind.theme.css`
- `globals.css` — a ready-to-paste stylesheet for a shadcn project

**Save Theme** downloads everything as `shadcn-theme-tokens-YYYY-MM-DD.zip`:

```
shadcn-theme-tokens/
  tokens/   Style Dictionary sources + the shadcn mapping (current editor state)
  css/      tokens.css, tailwind.theme.css, shadcn.theme.css, shadcn.overrides.css, globals.css
```

To make a saved theme this repo's new default, copy the three mapping files from the zip's `tokens/` folder into `tokens/` and run `npm run tokens:build`.

### Using the CSS in a shadcn project

Copy the files from the zip's `css/` folder next to each other and use `globals.css` as your project's global stylesheet. It imports `tokens.css`, `tailwind.theme.css` and `shadcn.theme.css` (plus `shadcn.overrides.css` when you set Theme overrides), exposes the shadcn variables to Tailwind, and includes the focus ring.

`shadcn.overrides.css` is unlayered, so it wins over Tailwind utilities, including a `className` passed to a single component. Use an important utility (for example `rounded-none!`) for one-off exceptions.

## Project structure

```
tokens/                     design-token sources + shadcn mapping (JSON)
scripts/
  build-tokens.mjs          Style Dictionary build → src/tokens/generated/
  sync-tokens.mjs           copies token sources from your token package
src/
  editor/                   theme editor (customizer, pickers, Get Code, Save Theme)
  preview/                  preview iframe (galleries, charts, Tokens view)
  theme/                    token catalog, shadcn variable list, config, CSS formatting
  styles/                   shared Tailwind bridge, focus ring
  registry/                 shadcn/ui components, examples, charts and styles
  tokens/generated/         build output (git-ignored)
```

## Known limitations

- **Token Bridge build:** the stock `build-tokens.js` in the Token Bridge package fails on `shadcn.semantic.json`, because its `border` and `radius` keys collide with the design system's `border.*` and `radius.*` groups. This project's build works around it, and `globals.css` from Save Theme works on its own.
- **Tailwind palette colors** that aren't design tokens (`sky`, `purple`, `gray`, `*-950`, …) and `font-light` aren't generated, so a few shadcn examples that use them lose those styles.
- **Icons:** only Lucide is included (shadcn's Create page also offers Tabler, Hugeicons, Phosphor and Remix).
- **Dark mode** has no dark tokens in the design system yet, so the dark mapping mostly points at primitives.
- `shadcn.extensions.json` isn't part of the Token Bridge adapter contract, so the Token Bridge package ignores it.

## Credits

The components, examples, charts and styles in `src/registry/` are ported from [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT). Syntax highlighting uses [Shiki](https://shiki.style); zips are created with [fflate](https://github.com/101arrowz/fflate).

## License

GPL-3.0 — see [LICENSE](LICENSE). Code ported from shadcn/ui remains under its MIT license.
